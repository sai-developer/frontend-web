import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Animator } from '../../animations';

@Component({
  selector: 'horz-bar-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './horz-bar-chart.component.html',
  styleUrls: ['./horz-bar-chart.component.scss'],
  animations: [Animator]
})
export class HorzBarChartComponent implements OnInit {
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

  margin = { top: 20, right: 40, bottom: 30, left: 80 };

  colorRangeMap = [
    { range: [0, 34], color: '#e81426' },
    { range: [33, 67], color: '#ffa000' },
    { range: [66, 1000], color: '#4caf50' }
  ];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    if (!this.input) {
      return;
    }
    this.margin = this.input.margin ? this.input.margin : this.margin;
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

    if (!this.input.data || this.input.data.length == 0) {
      this.emptyData = true;
      return;
    }

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');
    const reportInput = this.input;
    const data = reportInput.data;
    const colorRangeMap = this.colorRangeMap;

    const getColor = function(d: any) {
      let color = '#4CAF50';
      colorRangeMap.forEach(function(colorRange) {
        if (_.inRange(d.value ? d.value : d, colorRange.range[0], colorRange.range[1])) {
          color = colorRange.color;
        }
      });
      return color;
    };

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr('height', parseInt(element.style('width').slice(0, -2)) - parseInt(titleElem.style('height').slice(0, -2)));

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      parseInt(element.style('width').slice(0, -2)) -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;

    // Y-axis scale
    const y = d3
      .scaleBand()
      .rangeRound([0, contentHeight])
      .padding(0.05)
      .domain(
        data.map(function(d: any) {
          return d[reportInput.yField];
        })
      );

    // Left X-axis scale
    const x = d3
      .scaleLinear()
      .rangeRound([0, contentWidth])
      .domain([0, d3.max(data, d => parseFloat((d as any)[reportInput.xField]))]);
    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // Append Left Y Axis
    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => g.select('.domain').remove());

    // Draw Bars
    var bars = g
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('g');
    bars
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y((d as any)[reportInput.yField]))
      .attr('width', d => x((d as any)[reportInput.xField]))
      .attr('height', y.bandwidth())
      .style('fill', function(d: any) {
        return getColor(d[reportInput.xField]);
      });
    bars
      .append('text')
      .attr('class', 'bar-label')
      //y position of the label is halfway down the bar
      .attr('y', function(d) {
        return y((d as any)[reportInput.yField]) + y.bandwidth() / 2;
      })
      //x position is 1 pixels to the right of the bar
      .attr('x', function(d) {
        return x((d as any)[reportInput.xField]) + 1;
      })
      .text(function(d) {
        return (d as any)[reportInput.xField] + reportInput.xFieldSuffix;
      });

    this.emptyData = false;
  }
}
