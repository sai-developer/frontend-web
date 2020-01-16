import { Injectable } from '@angular/core';

export interface BadgeItem {
  type: string;
  value: string;
}

export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon: string;
  badge?: BadgeItem[];
  children?: ChildrenItems[];
}

const MENUITEMS : Menu[] = [
  {
    state: 'home',
    name: 'DASHBOARD',
    type: 'link',
    icon: 'explore'
  },
  {
    state: 'flight/status',
    name: 'FLIGHT STATUS',
    type: 'link',
    icon: 'flight_takeoff'
  }
];

@Injectable()
export class MenuItems {
  getAll(): Menu[] {
    return MENUITEMS;
  }
  
  add(menu: Menu) {
    MENUITEMS.push(menu);
  }
}
