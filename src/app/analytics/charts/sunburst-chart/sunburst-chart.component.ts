import { Component, OnInit, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';

import { Animator } from '../../animations';

@Component({
  selector: 'sunburst-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './sunburst-chart.component.html',
  styleUrls: ['./sunburst-chart.component.scss'],
  animations: [Animator]
})
export class SunburstChartComponent implements OnInit {
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

  margin = { top: 20, right: 100, bottom: 30, left: 70 };

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

    if (!this.input.data || this.input.data.children.length == 0) {
      this.emptyData = true;
      return;
    }

    // Chart Title element
    const titleElem = d3.select('#' + this.chartId).select('h6');

    // Chart Div and data
    const element = d3.select('#' + this.chartId).select('div');
    const data = this.input.data;
    let input = this.input;

    // Add SVG component
    const svg = element
      .append('svg')
      .attr('width', element.style('width'))
      .attr(
        'height',
        (parseInt(element.style('width').slice(0, -2)) * 5) / 6 - parseInt(titleElem.style('height').slice(0, -2))
      );

    var contentWidth = parseInt(element.style('width').slice(0, -2)) - this.margin.left - this.margin.right;
    const contentHeight =
      parseInt(element.style('height').slice(0, -2)) -
      this.margin.top -
      this.margin.bottom -
      parseInt(titleElem.style('height').slice(0, -2)) -
      30;
    let radius = contentWidth / 8;

    var x = d3.scaleLinear().rangeRound([0, 2 * Math.PI]);

    var y = d3.scaleLinear().rangeRound([0, radius]);

    const partition = function(data: any) {
      const root = d3
        .hierarchy(data)
        .sum(d => d[input.valField])
        .sort((a, b) => b[input.valField] - a[input.valField]);
      return d3.partition().size([2 * Math.PI, root.height + 1])(root);
    };

    const arc = d3
      .arc()
      .startAngle(function(d: any) {
        return d.x0;
      })
      .endAngle(function(d: any) {
        return d.x1;
      })
      .innerRadius(function(d: any) {
        return d.y0 * radius;
      })
      .outerRadius(function(d: any) {
        return Math.max(d.y0 * radius, d.y1 * radius - 1);
      });

    const computeTextRotation = function(d: any) {
      return ((x(d.x0 + d.x1 / 2) - Math.PI / 2) / Math.PI) * 180;
    };

    const getColor = function(status: string) {
      return status.indexOf('OnTime') >= 0 ? '#A0B700' : status.indexOf('Buffer') >= 0 ? '#FEC602' : '#FC6A0C';
    };

    const getClass = function(status: string) {
      return input.classMap[status];
    };

    const format = d3.format('.0%');

    const arcVisible = function(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    };

    const labelVisible = function(d: any) {
      return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    };

    const labelTransform = function(d: any) {
      const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      const y = ((d.y0 + d.y1) / 2) * radius;

      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    };

    const getPercent = function(d1: any, dispField: string) {
      let filtered: any[] = [];
      root.each(function(d: any) {
        if (d.depth == d1.depth && d.parent[dispField] == d1.parent[dispField]) {
          filtered.push(d);
        }
      });
      if (d1.parent) {
        var levelSum = d3.sum(filtered, function(d: any) {
          return d[input.valField];
        });
        return format(d1[input.valField] / levelSum);
      } else {
        return '';
      }
    };

    const clicked = function(p: any) {
      label.transition().attr('opacity', 0);
      parent.datum(p.parent || root);

      root.each(function(d: any) {
        d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        };
      });

      const t = g.transition().duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path
        .transition(t)
        .tween('data', function(d: any) {
          const i = d3.interpolate(d.current, d.target);
          return t => (d.current = i(t));
        })
        .attrTween('d', d => () => arc((d as any).current));

      const test = label.filter(function(d) {
        return arcVisible((d as any).target);
      });

      label
        .filter(function(d) {
          return labelVisible((d as any).target);
        })
        .transition(t)
        .attr('transform', function(d: any) {
          return labelTransform(d.target);
        })
        .attr('opacity', function(d: any) {
          return d.target.x1 - d.target.x0 >= 0.05 ? 1 : 0;
        });
    };

    var root = partition(data);
    root.each(function(d: any) {
      d.current = d;
    });

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${(contentWidth + this.margin.left + this.margin.right) / 2},${((contentWidth +
          this.margin.left +
          this.margin.right) *
          5) /
          6 /
          2})`
      );

    const path = g
      .append('g')
      .selectAll('path')
      .data(root.descendants().slice(1))
      //.join('path')			//works for d3 v5
      .enter()
      .append('path') //works for d3 v4
      .attr('class', function(d: any) {
        return getClass((d.children ? d : d.parent).data[input.dispField]);
      })
      .attr('d', function(d: any) {
        return arc(d);
      })
      .style('stroke', '#FFFFFF');

    path
      .filter(function(d: any) {
        return d.children;
      })
      .style('cursor', 'pointer')
      .on('click', clicked);

    path.append('title').text(function(d: any) {
      var title = '';
      title += d.depth > 0 ? 'Dep Flt No:' + d.data[input.dispField] + '\n' : '';
      title += d.depth == 3 ? 'Arr Flt No:' + d.data.arrFlt + '\n' : '';
      title += d.depth > 0 ? 'Flt Count:' + d[input.valField] + '\n' + 'Percent:' + getPercent(d, input.dispField) : '';
      return title;
    });

    const label = g
      .append('g')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('user-select', 'none')
      .selectAll('text')
      .data(root.descendants().slice(1))
      //.join('text')				//Works for d3 v5
      .enter()
      .append('text') //works for d3 v4
      .attr('dy', '0.35em')
      .attr('transform', d => labelTransform(d))
      .text(function(d: any) {
        return d.data[input.dispField];
      })
      .attr('class', 'arc-label')
      .attr('opacity', function(d: any) {
        return d.x1 - d.x0 >= 0.05 ? 1 : 0;
      });

    const parent = g
      .append('circle')
      .datum(root)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('click', clicked);

    this.emptyData = false;
  }
}
