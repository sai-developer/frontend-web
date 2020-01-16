import { Injectable } from '@angular/core';

export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  subchildren? : SuperChildrenItems[];
}

export interface SuperChildrenItems {
  state: string;
  name: string;
  type?: string;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  children?: ChildrenItems[];
}

const HORIZONTALMENUITEMS = [
  {
    state: 'home',
    name: 'DASHBOARD',
    type: 'link',
    icon: 'home'
  },
  {
    state: 'flight/status',
    name: 'FLIGHT STATUS',
    type: 'link',
    icon: 'flight_takeoff'
  }
];

@Injectable()
export class HorizontalMenuItems {
  getAll(): Menu[] {
    return HORIZONTALMENUITEMS;
  }
  add(menu: Menu) {
    // HORIZONTALMENUITEMS.push(Menu);
  }
}
