import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { Animator } from '../../animations';

@Component({
  selector: 'bar-line-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bar-line-chart.component.html',
  styleUrls: ['./bar-line-chart.component.scss'],
  animations: [Animator]
})
export class BarLineChartComponent implements OnInit {
  @ViewChild('chart')
  private chartContainer: ElementRef;

  @Input() animationType: any;

  @Input()
  input: any;

  @Input()
  chartId: string;

  @Input()
  chartTitle: string;

  emptyData: boolean = false;

  margin = { top: 20, right: 70, bottom: 60, left: 70 };

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    if (!this.input) {
      return;
    }
    console.log(this.input);
    this.createChart();
  }

  onResize($event: any) {
    this.createChart();
  }

  private createChart(): void {
    console.log(this.input);
    if (!this.input.data || this.input.data.length == 0) {
      this.emptyData = true;
      return;
    }
    // Remove old svg element
    d3.select('#' + this.chartId)
      .selectAll('svg')
      .remove();
    d3.selectAll('.' + this.chartId + '_tooltip').remove();

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    let element = d3.select('#' + this.chartId).select('div');

    const data = this.input.data;
    const reportInput = this.input;

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr(
        'height',
        parseInt(element.style('height').slice(0, -2)) - parseInt(titleElem.style('height').slice(0, -2))
      );

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      parseInt(element.style('height').slice(0, -2)) -
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

    // Left Y-axis scale
    const y = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, d => parseFloat((d as any)[reportInput.barField]))]);

    // Right Y-axis scale
    const y1 = d3
      .scaleLinear()
      .rangeRound([contentHeight, 0])
      .domain([0, d3.max(data, d => parseFloat((d as any)[reportInput.lineField]))]);

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
        return y1((d as any)[reportInput.lineField]);
      });

    const g = svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

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

    const showTooltip = function(d: any) {
      tzdiv
        .transition()
        .duration(50)
        .style('left', d3.event.pageX + 10 + 'px')
        .style('top', d3.event.pageY - 10 + 'px')
        .style('z-index', 9999)
        .style('opacity', 0.9);
      let html = '<table>';
      //html += ("<tr><td>" + d[reportInput.xField] + ":</td><td>" + d[reportInput.yField] + "</td></tr>");
      html +=
        "<tr><td><div style='width:8px; height:8px; background-color:black'>&nbsp;</div></td><td>OTP % </td><td>:" +
        d[reportInput.barField] +
        '</td></tr>';
      html +=
        "<tr><td><div style='width:8px; height:8px; background-color:#ff0000'>&nbsp;</div></td><td>No of Flights </td><td>:" +
        d[reportInput.lineField] +
        '</td></tr>';
      html += '</table>';
      tzinnerDiv.html(html);
    };

    const hideTooltip = function() {
      tzdiv
        .transition()
        .duration(50)
        .style('z-index', 0)
        .style('opacity', 0);
    };

    //Append X Axis
    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + contentHeight + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // X Axis Label
    g.append('text')
      .attr('transform', 'translate(' + contentWidth / 2 + ' ,' + (contentHeight + this.margin.top + 30) + ')')
      .style('text-anchor', 'middle')
      .text(reportInput.xFieldLabel)
      .attr('class', 'axis-label');

    // Append Left Y Axis
    g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3.axisLeft(y).ticks(10))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(reportInput.barFieldLabel);

    // Label for left Y Axis
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - this.margin.left / 1.5)
      .attr('x', 0 - contentHeight)
      .attr('dy', '0.5em')
      .style('text-anchor', 'left')
      .text(reportInput.barFieldLabel)
      .attr('class', 'axis-label');

    // Append Right Y Axis
    g.append('g')
      .attr('transform', 'translate(' + (contentWidth - 6) + ',0)')
      .attr('class', 'axis axis--y')
      .call(d3.axisRight(y1).ticks(10))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(reportInput.lineFieldLabel);

    // Label for Right Y Axis
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', contentWidth + this.margin.right / 1.75)
      .attr('x', 0 - contentHeight)
      .attr('dy', '0.5em')
      .style('text-anchor', 'left')
      .text(reportInput.lineFieldLabel)
      .attr('class', 'axis-label');

    // Draw Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x((d as any)[this.input.xField]))
      .attr('y', d => y((d as any)[this.input.barField]))
      .attr('width', x.bandwidth())
      .attr('height', d => contentHeight - y((d as any)[this.input.barField]))
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip);

    // Draw Line
    g.append('g')
      .append('path')
      .datum(data as any)
      .attr('class', 'line')
      .attr('d', line)
      .style('stroke', '#ff0000')
      .style('stroke-width', '2px')
      .style('fill', 'none');

    // Draw Legends
    const legendData = [{ name: 'OTP%', color: '#191c29' }, { name: 'Number of Flights', color: '#ff0000' }];
    var colors = ['steelblue', '#ff0000'];
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return contentWidth / (legendData.length + 1) / 2 + (i * contentWidth) / (legendData.length + 1);
      })
      .attr('y', function(d) {
        return contentHeight + 60;
      })
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', function(d) {
        return d.color;
      });
    g.append('g')
      .selectAll('.legend')
      .data(legendData)
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', function(d, i) {
        return 20 + contentWidth / (legendData.length + 1) / 2 + (i * contentWidth) / (legendData.length + 1);
      })
      .attr('y', function(d) {
        return contentHeight + 60 + 5;
      })
      .attr('dy', '.5em')
      .style('text-anchor', 'left')
      .text(function(d) {
        return d.name;
      })
      .attr('class', 'legend-label');

    this.emptyData = false;
  }
}
