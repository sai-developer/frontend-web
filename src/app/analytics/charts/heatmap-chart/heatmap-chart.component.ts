import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import { Animator } from '../../animations';

@Component({
  selector: 'heatmap-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './heatmap-chart.component.html',
  styleUrls: ['./heatmap-chart.component.scss'],
  animations: [Animator]
})
export class HeatmapChartComponent implements OnInit {
  @Input() animationType: any;

  @Input()
  input: any;

  @Input()
  chartId: string;

  @Input()
  chartTitle: string;

  @Input()
  titleSuffix: string;

  emptyData: boolean = false;

  margin = { top: 60, right: 100, bottom: 20, left: 100 };

  colorRangeMap = [
    { range: [0, 34], color: '#e81426' },
    { range: [33, 67], color: '#ffa000' },
    { range: [66, 101], color: '#4caf50' }
  ];

  toolTipList = [{ label: 'Flight Count: ', value: 'Flcount' }, { label: 'Flight %: ', value: 'value' }];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    if (!this.input) {
      return;
    }
    this.createChart();
  }

  onResize($event: any) {
    this.createChart();
  }

  private createChart(): void {
    let toolTipList = this.toolTipList;
    // Remove old svg element
    d3.select('#' + this.chartId)
      .selectAll('svg')
      .remove();
    d3.select('.' + this.chartId + '_tooltip').remove();

    if (!this.input.data || this.input.data.length == 0) {
      this.emptyData = true;
      return;
    }
    const repInput = this.input;
    repInput.valField = this.input.valField ? this.input.valField : 'value';
    repInput.rowField = this.input.rowField ? this.input.rowField : 'task';
    repInput.colField = this.input.colField ? this.input.colField : 'shift';
    this.margin = this.input.margin ? this.input.margin : this.margin;
    this.colorRangeMap = this.input.colorRangeMap ? this.input.colorRangeMap : this.colorRangeMap;
    toolTipList = this.input.toolTipList ? this.input.toolTipList : this.toolTipList;

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');
    const data = this.input.data;
    const colorRangeMap = this.colorRangeMap;

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr(
        'height',
        (parseInt(element.style('width').slice(0, -2)) * 3) / 4 - parseInt(titleElem.style('height').slice(0, -2))
      );

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      (parseInt(element.style('width').slice(0, -2)) * 3) / 4 -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;

    var x_elements = d3
        .set(
          data.map(function(item: any) {
            return item[repInput.colField];
          })
        )
        .values(),
      y_elements = d3
        .set(
          data.map(function(item: any) {
            return item[repInput.rowField];
          })
        )
        .values();

    const getColor = function(d: any) {
      let color = '#4CAF50';
      colorRangeMap.forEach(function(colorRange) {
        if (_.inRange(d[repInput.valField] ? d[repInput.valField] : d, colorRange.range[0], colorRange.range[1])) {
          color = colorRange.color;
        }
      });
      return color;
    };

    var itemSize = 22,
      cellSize = itemSize - 1;

    const xScale = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.04)
      .domain(
        data.map(function(d: any) {
          return d[repInput.colField];
        })
      );

    var yScale = d3
      .scaleBand()
      .rangeRound([0, contentHeight])
      .padding(0.04)
      .domain(
        data.map(function(d: any) {
          return d[repInput.rowField];
        })
      );

    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // Append Left Y Axis
    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(yScale).tickSize(0))
      .call(g => g.select('.domain').remove());

    //Append X Axis
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,0)')
      .call(
        d3
          .axisTop(xScale)
          .tickSize(0)
          .tickFormat(function(d) {
            return d.toLowerCase() == 'undefined' ? 'NA' : d;
          })
      )
      .call(g => g.select('.domain').remove())
      .selectAll('text')
      .style('text-anchor', 'start')
      .attr('dx', '1em')
      .attr('dy', '-0.5em')
      .attr('transform', 'rotate(-45)');

    // Tooltip
    var tzdiv = d3
      .select('body')
      .append('div')
      .attr('class', 'popover fade top in ' + this.chartId + '_tooltip')
      .style('opacity', 0)
      .style('z-index', 9999)
      .style('display', 'block')
      .style('padding', 10);
    var tzinnerDiv = d3
      .select('div.' + this.chartId + '_tooltip')
      .append('div')
      .attr('class', 'popover-content')
      .style('left', '50%');

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('g')
      .append('rect')
      .attr('class', 'cell')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('y', function(d: any) {
        return yScale(d[repInput.rowField]);
      })
      .attr('x', function(d: any) {
        return xScale(d[repInput.colField]);
      })
      .attr('fill', function(d: any) {
        return getColor(d);
      })
      .on('mouseover', function(d) {
        tzdiv
          .transition()
          .duration(50)
          .style('left', d3.event.pageX + xScale.bandwidth() / 4 + 'px')
          .style('top', d3.event.pageY - yScale.bandwidth() + 'px')
          .style('z-index', 9999)
          .style('opacity', 0.9);
        let html = '<table>';
        toolTipList.forEach(function(tooltip: any) {
          html += '<tr>';
          html += '<td>' + tooltip.label + ' </td>';
          html += '<td>' + (d as any)[tooltip.value] + ' </td>';
          html += '</tr>';
        });
        html += '</table>';
        tzinnerDiv.html(html);
      })
      .on('mouseout', function(d) {
        tzdiv
          .transition()
          .duration(50)
          .style('z-index', 0)
          .style('opacity', 0);
      });

    // Draw Legends
    const legendData = _.map(colorRangeMap, 'range');
    var colors = ['steelblue', '#ff0000'];
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return (contentWidth / 3) * (i % 3);
      })
      .attr('y', function(d, i) {
        return contentHeight + 25 + Math.floor(i / 3) * 25;
      })
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', function(d) {
        return getColor(d[0]);
      });
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return 20 + (contentWidth / 3) * (i % 3);
      })
      .attr('y', function(d, i) {
        return contentHeight + 25 + Math.floor(i / 3) * 25 + 5;
      })
      .attr('dy', '.5em')
      .style('text-anchor', 'left')
      .text(function(d: any) {
        return d[0] + 1 + '-' + (d[1] - 1);
      })
      .attr('class', 'legend-label');

    this.emptyData = false;
  }
}
