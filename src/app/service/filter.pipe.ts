import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
  name: 'SearchPipe'
})

export class SearchPipe implements PipeTransform {
  transform(list: any[], searchText: string, field?: string, field1?: string, field2?: string, field3?: string): any {
    if (searchText) {
      if (list && field != undefined && field1 != undefined && field2 != undefined && field3 == "name") {
        // console.log("staff")
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1
          || item[field2].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || item.userRoleMasterList[0].name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }

      else if (list && field != undefined && field1 != undefined && field2 != undefined) {
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1
          || item[field2].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }

      else if (list && field != undefined && field1 != undefined) {
        // console.log("shift")
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }
      else if (list && field != undefined) {
        // console.log("roster")
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }
    }
    else {
      return list
    }
  }
}


@Pipe({
  name: 'MasterSearch'
})

export class MasterSearch implements PipeTransform {

  transform(list: any[], searchText: any, field: string, field1?: string, field2?: string, field3?: string, field4?: string, field5?: string): any {
    if (searchText) {
      if (field == 'task_name') {
        return list.filter(item => item[0].task_name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }

      else if (typeof searchText === 'string' && field == 'name' && field1 == 'name') {
        // console.log("taskinfo")
        return list.filter(item => item.taskId[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 || item.taskId.activityId[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }

      else if (list && field != undefined && field1 != undefined && field2 == 'code' && field3 == 'code' && field4 == 'flightType') {
        // console.log("flight schedules")
        var value = (searchText.toLowerCase().startsWith('ba') ? 0 : searchText.toLowerCase().startsWith('tr') ? 1 : searchText.toLowerCase().startsWith('tu') ? 2 : searchText.toLowerCase().startsWith('te') ? 3 : 4)
        return list.filter(item => (item[field] != null ? item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (item[field1] != null ? item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
          || (item.origin.code != null ? item.origin.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item.destination.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (item.destination.code != null ? item.destination.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item.origin.code.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
          || item[field4] === value || item.equipmentTypeId.type.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }

      else if (list && field == 'bayCode') {
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }
      else if (field == 'tailNumber') {
        
        let filtered = [];
        let noData: boolean = true;
        list.forEach(type => {
          let filterdTails = type.tails.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1);
          let equType: string = '';
          if (filterdTails.length !== 0) {
            equType = type.type;
            noData = false;
          }
          else {
            equType = '';
          }
          filtered.push({
            type: equType,
            tails: filterdTails
          });

        });
        if (noData) {
          return [-1];
        }
        else {
          return filtered;
        }
      }

    }

    else {
      return list
    }
  }
}
@Pipe({
  name: 'ReportSearch'
})

export class ReportSearch implements PipeTransform {
  transform(list: any[], searchText: string, field: string, field1?: string, field2?: string, field3?: string): any {
    if (searchText) {
      if (list && field != undefined && field1 != undefined && field2 == 'origin' && field3 == 'destination') {
        return list.filter(item => (item[field] != null ? item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (item[field1] != null ? item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
          || (item.origin != null ? item.origin.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item.destination.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (item.destination != null ? item.destination.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item.origin.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
        )
      }


      if (list && searchText && field != undefined && field1 != undefined) {
        return list.filter(item => (item[field] != null ? item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1) || (item[field1] != null ? item[field1].toLowerCase().indexOf(searchText.toLowerCase()) !== -1 : item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1))
      }
      else if (list && searchText && field != undefined) {
        return list.filter(item => item[field].toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      }
    }
    else {
      return list
    }
  }
}
