import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as d3_scale from 'd3-scale-chromatic';
import * as _ from 'lodash';

import { Animator } from '../../animations';

@Component({
  selector: 'donut-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './donut-chart.component.html',
  styleUrls: ['./donut-chart.component.scss'],
  animations: [Animator]
})
export class DonutChartComponent implements OnInit {
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

  margin = { top: 40, right: 50, bottom: 30, left: 0 };

  toolTipList = [{ label: 'Name: ', value: 'name' }, { label: 'Value :', value: 'value' }];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    this.clearChart();
    if (!this.input) {
      return;
    }
    if (!this.input.data || this.input.data.length == 0) {
      this.emptyData = true;
      return;
    }
    const repValField = this.input.valField;
    if (
      _.sumBy(this.input.data, function(data) {
        return data[repValField];
      }) == 0
    ) {
      this.emptyData = true;
      return;
    }

    this.margin = this.input.margin ? this.input.margin : this.margin;
    this.toolTipList = this.input.toolTipList ? this.input.toolTipList : this.toolTipList;
    this.createChart();
  }

  onResize($event: any) {
    this.createChart();
  }

  private clearChart(): void {
    // Remove old svg element
    d3.select('#' + this.chartId)
      .selectAll('svg')
      .remove();
    d3.select('.' + this.chartId + '_tooltip').remove();
  }

  private createChart(): void {
    let toolTipList = this.toolTipList;

    this.clearChart();

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');
    const data = this.input.data;
    const repInput = this.input;

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr('height', parseInt(element.style('width').slice(0, -2)) - parseInt(titleElem.style('height').slice(0, -2)));

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      parseInt(element.style('height').slice(0, -2)) -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;
    //let radius = Math.min(contentWidth, contentHeight) / 2;
    let radius = contentWidth / 2;

    var x = d3.scaleLinear().rangeRound([0, 2 * Math.PI]);

    var y = d3.scaleLinear().rangeRound([0, radius]);

    const arc = d3
      .arc()
      .outerRadius(radius * 0.6)
      .innerRadius(radius * 0.3);

    const pie = d3
      .pie()
      .sort(null)
      .value(function(d: any) {
        return d[repInput.valField] ? d[repInput.valField] : 0;
      });

    //const color = d3.scaleOrdinal(d3['schemePaired']);		//works for d3 v5
    const color = d3.scaleOrdinal(d3_scale['schemePaired']); //works for d3 v4
    const midAngle = function(d: any) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    };

    const g1 = svg.append('g').attr('transform', `translate(${radius}, ${radius - 40})`);

    const toolTipText = svg
      .append('text')
      .attr('transform', `translate(${radius}, ${radius - 40})`)
      .attr('class', 'tool-tip')
      .style('text-anchor', 'middle')
      .html('');

    const g = g1
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .style('cursor', 'hand');

    g.append('path')
      .each(function(d: any) {
        (this as any)._current = d;
      })
      .attr('d', arc as any)
      .attr('class', 'arc')
      .style('fill', function(d: any, i: any) {
        return color(i);
      });

    var outerArc1 = d3
      .arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);
    var outerArc2 = d3
      .arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

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

    g.on('mouseover', function(d: any) {
      toolTipText.html(
        d[repInput.valField]
          ? d[repInput.valField]
          : d.data[repInput.valField] + (repInput.toolTipSuffix ? repInput.toolTipSuffix : '')
      );
      tzdiv
        .transition()
        .duration(50)
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 10 + 'px')
        .style('z-index', 9999)
        .style('opacity', 0.9);
      let html = '<table>';
      toolTipList.forEach(function(tooltip: any) {
        html += '<tr>';
        html += '<td>' + tooltip.label + ' </td>';
        html += '<td>' + d.data[tooltip.value] + ' </td>';
        html += '</tr>';
      });

      html += '</table>';
      tzinnerDiv.html(html);
    });

    g.on('mouseout', function(obj) {
      toolTipText.html('');
      tzdiv
        .transition()
        .duration(50)
        .style('z-index', 0)
        .style('opacity', 0);
    });

    g.on('click', function(d: any) {
      if (repInput['clickEnabled']) {
        repInput['callback'](d.data.name);
      }
    });

    g1.append('g')
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return 25 - radius + (contentWidth / 2) * (i % 2);
      })
      .attr('y', function(d: any, i: any) {
        return 35 + radius / 2 + Math.floor(i / 2) * 15 + 5;
      })
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function(d: any, i: any) {
        let colr = color(i);
        return colr;
      });
    g1.append('g')
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'legend-label')
      .attr('x', function(d, i) {
        return 25 - radius + (contentWidth / 2) * (i % 2) + 15;
      })
      .attr('y', function(d: any, i: any) {
        return 35 + radius / 2 + Math.floor(i / 2) * 15 + 10;
      })
      .attr('dy', '.5em')
      .style('text-anchor', 'left')
      .text(function(d) {
        return d[repInput.dispField];
      })
      .style('font-size', '12px');

    this.emptyData = false;
  }
}
