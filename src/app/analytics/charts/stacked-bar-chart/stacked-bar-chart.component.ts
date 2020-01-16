import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import { Animator } from '../../animations';

@Component({
  selector: 'stacked-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.scss'],
  animations: [Animator]
})
export class StackedBarChartComponent implements OnInit {
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
  margin = { top: 20, right: 40, bottom: 30, left: 40 };

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
    // Remove old svg element
    d3.select('#' + this.chartId)
      .selectAll('svg')
      .remove();
    d3.select('.' + this.chartId + '_tooltip').remove();
    if (!this.input.data || this.input.data.length == 0) {
      this.emptyData = true;
      return;
    }

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr(
        'height',
        parseInt(element.style('width').slice(0, -2)) + 100 - parseInt(titleElem.style('height').slice(0, -2))
      );

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      parseInt(element.style('width').slice(0, -2)) +
      60 -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;

    const rawData = this.input.data;

    const groupedData = _.groupBy(rawData, function(b: any) {
      return b.bay;
    });
    const sortedRawData = _.sortBy(rawData, ['bay', 'status']);

    let prevData: any;
    sortedRawData.forEach(function(data: any) {
      if (prevData && prevData.bay == data.bay) {
        data.cumulative = data.flights + prevData.cumulative;
      } else {
        data.cumulative = data.flights;
      }
      prevData = data;
    });

    _.reverse(sortedRawData);

    const rs1: any[] = [];
    _.keys(groupedData).forEach(function(key: any) {
      rs1.push({ bay: key, values: groupedData[key] });
    });

    const colorMap = { Ontime: '#4caf50', Buffer: '#ffa000', Delay: '#e81426', Undefined: 'grey' };

    const getColor = function(status: any) {
      return colorMap[status];
    };

    // X-axis scale
    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.1)
      .domain(_.keys(groupedData));

    // Left Y-axis scale
    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(sortedRawData, d => (d as any).cumulative)]);

    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    //Append X Axis
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(
        d3
          .axisBottom(x)
          .tickSize(0)
          .tickFormat(function(d) {
            return d.toLowerCase() == 'undefined' ? 'NA' : d;
          })
      );

    // Append Left Y Axis
    g.append('g')
      .attr('class', 'axis axis--y')
      .call(
        d3
          .axisLeft(y)
          .ticks(10)
          .tickSize(0)
      )
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Frequency');

    g.append('g')
      .attr('class', 'grid-lines')
      .selectAll('.grid-line')
      .data(y.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', contentWidth)
      .attr('y1', y)
      .attr('y2', y);

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

    // Draw Bars
    g.selectAll('.bar')
      .data(sortedRawData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x((d as any).bay))
      .attr('y', d => y((d as any).cumulative))
      .attr('width', x.bandwidth())
      .attr('height', d => contentHeight - y((d as any).cumulative))
      .attr('fill', function(d) {
        return getColor(d.status);
      })
      .on('mouseover', function(d: any) {
        tzdiv
          .transition()
          .duration(50)
          .style('left', d3.event.pageX + 0 + 'px')
          .style('top', d3.event.pageY - 0 + 'px')
          .style('z-index', 9999)
          .style('opacity', 0.9);
        let tableData = groupedData[d.bay];
        let html = '<table>';
        tableData.forEach(function(data) {
          html +=
            '<tr><td>' +
            (data.status.toLowerCase() == 'undefined' ? 'NA' : data.status) +
            '</td><td>' +
            data.flights +
            '</td></tr>';
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
    const legendData = _.keys(colorMap);
    var colors = ['steelblue', '#ff0000'];
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return (contentWidth / 2) * (i % 2);
      })
      .attr('y', function(d, i) {
        return contentHeight + 25 + Math.floor(i / 2) * 25;
      })
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', function(d) {
        return colorMap[d];
      });
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return 20 + (contentWidth / 2) * (i % 2);
      })
      .attr('y', function(d, i) {
        return contentHeight + 25 + Math.floor(i / 2) * 25 + 5;
      })
      .attr('dy', '.5em')
      .style('text-anchor', 'left')
      .text(function(d) {
        return d.toLowerCase() == 'undefined' ? 'NA' : d;
      })
      .attr('class', 'legend-label');

    this.emptyData = false;
  }
}
