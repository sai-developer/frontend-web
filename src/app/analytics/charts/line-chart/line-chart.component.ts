import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import { Animator } from '../../animations';

@Component({
  selector: 'line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  animations: [Animator]
})
export class LineChartComponent implements OnInit {
  @Input() animationType: any;

  @Input()
  input: any;

  @Input()
  chartId: string;

  @Input()
  chartTitle: string;

  @Input()
  subTitle: string;

  @Input()
  titleSuffix: string;

  emptyData: boolean = false;

  margin = { top: 20, right: 30, bottom: 30, left: 40 };

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    this.emptyData = false;
    if (!this.input) {
      return;
    }
    if (this.input.data.length == 0) {
      this.showNoData();
      this.emptyData = true;
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
    d3.selectAll('#' + this.chartId + 'no-data').remove();
    d3.select('.' + this.chartId + '_tooltip').remove();

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');
    const data = this.input.data;
    const reportInput = this.input;

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr(
        'height',
        (parseInt(element.style('width').slice(0, -2)) / 3) * 2 - parseInt(titleElem.style('height').slice(0, -2)) + 25
      );

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      (parseInt(element.style('width').slice(0, -2)) / 3) * 2 -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;

    // X-axis scale
    const x = d3
      .scaleBand()
      .rangeRound([0, contentWidth])
      .padding(0.5)
      .domain(
        data.map(function(d: any) {
          return d[reportInput.xField];
        })
      );

    // Y-axis scale
    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, d => parseFloat((d as any)[reportInput.yField]))]);

    // Line generator
    var line = d3
      .line()
      .x(function(d, i) {
        //console.log(d as any);
        //console.log((d as any)[reportInput.xField]);
        //console.log(x((d as any)[reportInput.xField]));
        return x((d as any)[reportInput.xField]) + x.bandwidth() / 2;
      })
      .y(function(d, i) {
        return y((d as any)[reportInput.yField]);
      });

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
            return d.split(' on ')[0];
          })
      )
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)'); // Commented temporarily // Append Left Y Axis

    // X Axis Label
    /* g.append('text')
      .attr('transform', 'translate(' + contentWidth / 2 + ' ,' + (contentHeight + this.margin.top + 10) + ')')
      .style('text-anchor', 'middle')
      .text(reportInput.xFieldLabel)
      .attr('class', 'axis-label');*/ g.append(
      'g'
    )
      .attr('class', 'axis axis--y')
      .call(
        d3
          .axisLeft(y)
          .ticks(10)
          .tickSize(0)
      )
      .select('.domain')
      .remove()
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(reportInput.yFieldLabel);

    // Label for left Y Axis
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left / 1.5)
      .attr('x', 0 - contentHeight)
      .attr('dy', '0.5em')
      .style('text-anchor', 'left')
      .text(reportInput.yFieldLabel)
      .attr('class', 'axis-label');

    // Draw Line
    g.append('g')
      .append('path')
      .datum(data as any)
      .attr('class', 'line')
      .attr('d', line)
      .style('stroke-width', '2px')
      .style('fill', 'none');

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

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'circle')
      .attr('cx', function(d: any) {
        return x(d[reportInput.xField]) + x.bandwidth() / 2;
      })
      .attr('cy', function(d: any) {
        return y(d[reportInput.yField]);
      })
      .attr('r', 6)
      .on('mouseover', function(d: any) {
        tzdiv
          .transition()
          .duration(50)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 10 + 'px')
          .style('z-index', 9999)
          .style('opacity', 0.9);
        let html = '<table>';
        //html += ("<tr><td>" + d[reportInput.xField] + ":</td><td>" + d[reportInput.yField] + "</td></tr>");
        html += '<tr><td>Arr Flt # </td><td>:' + d['ARR_FLIGHT_NUMBER'] + '</td></tr>';
        html +=
          '<tr><td>Dep Flt # </td><td>:' +
          d['flight']
            .split(' ')
            .splice(0, 1)
            .join('') +
          '</td></tr>';
        html +=
          '<tr><td>Cross Task Interval (in mins) </td><td>:' +
          (d['CROSS_TASK_INTERVAL'] == null ? 0 : d['CROSS_TASK_INTERVAL']) +
          '</td></tr>';
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
  }

  private showNoData() {
    d3.selectAll('#' + this.chartId + 'no-data').remove();
    d3.select('#' + this.chartId)
      .selectAll('svg')
      .remove();
    /*d3.select('#' + this.chartId)
      .append('div')
      .attr('id', this.chartId + 'no-data')
      .html('NO DATA TO DISPLAY');*/
  }
}
