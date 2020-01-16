import { Component, OnInit, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'grnd-sum-table',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './grnd-sum-table.component.html',
  styleUrls: ['./grnd-sum-table.component.scss']
})
export class GrndSumTableComponent implements OnInit {
  @Input()
  input: any;

  @Input()
  tableTitle: string;

  sortAsc: boolean = true;
  sortField: string;
  pageNo: number = 1;
  pageSize: number = 10;
  searchValue: string = '';
  displayData: any;
  totalPages: number = 1;
  filteredData: any;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(): void {
    if (!this.input) {
      this.input = { data: [] };
      return;
    }
    this.filteredData = this.input.data;
    this.sortField = _.keys(this.input.data[0])[0];
    this.updateData();
  }

  getColNames() {
    return _.keys(this.input.data[0]);
  }

  getHeaderClass(colName: string) {
    if (colName == this.sortField) {
      return this.sortAsc ? 'sorting_asc sorting_1' : 'sorting_desc sorting_1';
    } else {
      return 'sorting';
    }
  }

  getRowClass(index: any) {
    return index % 2 == 0 ? 'even' : 'odd';
  }

  getCellClass(colName: string) {
    return colName == this.sortField ? 'sorting_1' : '';
  }

  getPageRange() {
    return _.range(this.pageNo, this.totalPages < this.pageNo + 3 ? this.totalPages + 1 : this.pageNo + 3);
  }

  selectPageSize() {
    this.updateData();
  }

  setCurrentPage(pageNo: number) {
    this.pageNo = pageNo;
    this.updateData();
  }

  showPrevious() {
    this.pageNo = this.pageNo - 1;
    this.updateData();
  }

  showNext() {
    this.pageNo = this.pageNo + 1;
    this.updateData();
  }

  sortTable(colName: string) {
    this.sortAsc = this.sortField != colName ? true : !this.sortAsc;
    this.sortField = colName;
    this.updateData();
  }

  searchTable() {
    if (this.searchValue) {
      var colNames = _.keys(this.input.data[0]);
      var searchValue = this.searchValue;
      this.filteredData = _.filter(this.input.data, function(data: any) {
        var selected = false;
        colNames.forEach(function(col: any) {
          if (
            data[col]
              .toString()
              .toLowerCase()
              .indexOf(searchValue.toLowerCase()) >= 0
          ) {
            selected = true;
          }
        });
        return selected;
      });
    } else {
      this.filteredData = this.input.data;
    }
    this.updateData();
  }

  updateData() {
    let sortedData = _.orderBy(this.filteredData, [this.sortField], [this.sortAsc ? 'asc' : 'desc']);
    this.totalPages = Math.ceil(sortedData.length / this.pageSize);
    this.displayData = _.slice(sortedData, (this.pageNo - 1) * this.pageSize, this.pageNo * this.pageSize);
  }
}
