import { Pipe, PipeTransform } from '@angular/core';
import * as mz from 'moment-timezone';

@Pipe({
  name: 'FilterPipe'
})

export class FilterPipe implements PipeTransform {
  transform(source: any[], args: string, field: string): any {
    return !!(source && args && field) ? source.filter(item => item[field].toLowerCase().indexOf(args.toLowerCase()) !== -1) : source;
  }
}

@Pipe({
  name: 'CheckPipe'
})

export class CheckPipe implements PipeTransform {
  transform(source: any[], args: string, field: string): any {
    return !!(source && args && field) ? source.filter(item => item[field].toLowerCase().indexOf(args.toLowerCase()) !== -1) : source;
  }
}


// @Pipe({
//   name: 'EqpFilterPipe'
// })

// export class EqpFilterPipe implements PipeTransform {
//   transform(source: any[], args: string, field: string): any {
//     return !!(source && args && field) ? source.filter(item => item[field].toLowerCase().indexOf(args.toLowerCase()) !== -1) : source;
//   }
// }

@Pipe({
  name: 'RemoveMenuItem'
})
export class RemoveMenuItem implements PipeTransform {
  transform(menuItems: any[], curMenuItems: any[]) {
    let result = [];
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].state !== curMenuItems[0].state) {
        result.push(menuItems[i]);
      }
    }
    return result;
  }
}

@Pipe({
  name: 'TaskBG'
})
export class TaskBG implements PipeTransform {
  transform(task: any) {
    // let percentage = (task.taskCompletedCount/task.taskAssignedCount)*100;
    // let color;
    //   if(percentage == 0 && percentage<=1){
    //     color = 'expecting';
    //    }else if(percentage>=1 && percentage<=33){
    //       color = 'delay';
    //       }
    //       else if (percentage>33 && percentage<=66){
    //       color = 'warning';
    //       }else if(percentage>66&& percentage<=100){
    //       color = 'save'
    //       }
    //       else{
    //        color = 'expecting';
    //     }
    // console.log(task);
    // console.log(task.flight_flag);
    let color
    if (task.flight_flag == 0) {
      color = 'save';
    } else if (task.flight_flag == 1) {
      color = 'delay';
    } else if (task.flight_flag == 2) {
      color = 'warning';
    } else if (task.flight_flag == null) {
      color = 'expecting';
    }
    console.log(color)
    return color;
  }
}

@Pipe({
  name: 'flightColor'
})
export class flightColor implements PipeTransform {
  transform(flight: any) {
    // console.log('from the transform--------------',flight);
    let obj = {
      sta: flight.standardArrivalTime,
      std: flight.standardDepartureTime,
      eta: flight.estimatedArrivalTime,
      etd: flight.estimatedDepartureTime,
      ata: flight.actualArrivalTime,
      atd: flight.actualDepartureTime
    };
    let color = {
      arrColor: '',
      depColor: ''
    };
    if (((obj.sta) || (obj.std)) && ((obj.eta == null) || (obj.etd == null))) {
      if (obj.sta || obj.sta == null) {
        color.arrColor = 'grey'
      }
      if (obj.std || obj.std == null) {
        color.depColor = 'grey'
      }
    }
    if (((obj.eta) || (obj.etd)) && ((obj.ata == null) || (obj.atd == null))) {
      if (obj.eta) {
        color.arrColor = 'red'
        if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) <= 15) {
          color.arrColor = 'green'
        } else if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) < 0) {
          color.arrColor = 'green'
        } else if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) <= 30) {
          color.arrColor = 'amber'
        }
      }
      if (obj.etd) {
        color.depColor = 'red'
        if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) <= 15) {
          color.depColor = 'green'
        } else if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) < 0) {
          color.depColor = 'green'
        } else if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) <= 30) {
          color.depColor = 'amber'
        }
      }
    }
    if ((obj.ata) || (obj.atd)) {
      if (obj.ata) {
        color.arrColor = 'red'
        if (mz(obj.ata).diff(mz(obj.sta), 'minutes', true) <= 15) {
          color.arrColor = 'green'
        } else if (mz(obj.ata).diff(mz(obj.sta), 'minutes', true) < 0) {
          color.arrColor = 'green'
        }

      }
      if (obj.atd) {
        color.depColor = 'red'
        if (mz(obj.atd).diff(mz(obj.std), 'minutes', true) <= 15) {
          color.depColor = 'green'
        } else if (mz(obj.atd).diff(mz(obj.std), 'minutes', true) < 0) {
          color.depColor = 'green'
        }
      }
    }

    return color;
  }
}
@Pipe({
  name: 'TemflightColor'
})
export class TemflightColor implements PipeTransform {
  transform(flight: any) {
    let obj = {
      sta: flight.sta,
      std: flight.std,
      eta: flight.eta,
      etd: flight.etd,
      ata: flight.ata,
      atd: flight.atd
    };
    let color = {
      arrColor: '',
      depColor: ''
    };
    if (((obj.sta) || (obj.std)) && ((obj.eta == null) || (obj.etd == null))) {
      if (obj.sta || obj.sta == null) {
        color.arrColor = 'grey'
      }
      if (obj.std || obj.std == null) {
        color.depColor = 'grey'
      }
    }
    if (((obj.eta) || (obj.etd)) && ((obj.ata == null) || (obj.atd == null))) {
      if (obj.eta) {
        color.arrColor = 'red'
        if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) <= 15) {
          color.arrColor = 'green'
        } else if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) < 0) {
          color.arrColor = 'green'
        } else if (mz(obj.eta).diff(mz(obj.sta), 'minutes', true) <= 30) {
          color.arrColor = 'amber'
        }
      }
      if (obj.etd) {
        color.depColor = 'red'
        if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) <= 15) {
          color.depColor = 'green'
        } else if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) < 0) {
          color.depColor = 'green'
        } else if (mz(obj.etd).diff(mz(obj.std), 'minutes', true) <= 30) {
          color.depColor = 'amber'
        }
      }
    }
    if ((obj.ata) || (obj.atd)) {
      if (obj.ata) {
        color.arrColor = 'red'
        if (mz(obj.ata).diff(mz(obj.sta), 'minutes', true) <= 15) {
          color.arrColor = 'green'
        } else if (mz(obj.ata).diff(mz(obj.sta), 'minutes', true) < 0) {
          color.arrColor = 'green'
        }

      }
      if (obj.atd) {
        color.depColor = 'red'
        if (mz(obj.atd).diff(mz(obj.std), 'minutes', true) <= 15) {
          color.depColor = 'green'
        } else if (mz(obj.atd).diff(mz(obj.std), 'minutes', true) < 0) {
          color.depColor = 'green'
        }
      }
    }

    return color;
  }
}


@Pipe({
  name: 'TaskStatusLogic'
})
export class TaskStatusLogic implements PipeTransform {
  transform(task: any, currenttime) {
    // console.log(task)
    let obj = {
      classname: '',
    }
    if (task.planedtask === "planned") {
      if (mz(task.start).isSame(task.end)) {
        task.thold = mz(task.start).add(30, 'seconds').toDate();
      } else {
        let d = task.details.taskDuration * 0.1
        task.thold = mz(task.start).add(d, 'minutes').toDate();
      }

      if (mz(currenttime).diff(task.start) <= 0) {
        if (mz(task.start).isSame(task.end)) {
          obj.classname = 'plan'
        } else {
          obj.classname = 'planned';
        }
      }


      if (mz(currenttime).diff(task.start) > 0 && mz(currenttime).diff(task.thold) <= 0) {
        obj.classname = 'border-amber'
      }


      if (mz(currenttime).diff(task.thold) > 0) {
        obj.classname = 'border-red'
      }
    }

    return obj;



  }
}
@Pipe({
  name: 'SortValues'
})
export class SortValues implements PipeTransform {
  transform(source: any[] = [], field: string = ''): any[] {
    source.sort(function (a, b) {
      return a[field] < b[field] ? -1 : (a[field] > b[field] ? 1 : 0);
    });
    return source;
  }
}

@Pipe({
  name: 'ParseValues'
})
export class ParseValues implements PipeTransform {
  transform(source: any[] = [], field: string): any[] {
    let result = [];
    let fields = field.split('.');
    for (let i = 0; i < source.length; i++) {
      let value = source[i][fields[0]] || '';
      value = fields[1] && source[i][fields[0]][fields[1]] ? source[i][fields[0]][fields[1]] : value;
      if (!!value) {
        result.push(value);
      }
    }
    return result;
  }
}

