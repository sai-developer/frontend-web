import { trigger, state, style, animate, transition } from '@angular/animations';

export const Animator = [
  trigger('animator', [
    state('show', style({ opacity: 1 })),
    state('slide-in-left', style({ opacity: 1 })),
    state('slide-in-right', style({ opacity: 1 })),
    state('slide-in-top', style({ opacity: 1 })),
    state('slide-in-bottom', style({ opacity: 1 })),
    state('zoom-in-show', style({ opacity: 1 })),
    state('zoom-out-show', style({ opacity: 1 })),

    transition('* => show', [style({ opacity: 0 }), animate('500ms ease-in', style({ opacity: 1 }))]),
    transition('* => slide-in-top', [
      style({ opacity: 0, transform: 'translateY(-100%)' }),
      animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0%)' }))
    ]),
    transition('* => slide-in-bottom', [
      style({ opacity: 0, transform: 'translateY(100%)' }),
      animate('500ms ease-in', style({ opacity: 1, transform: 'translateY(0%)' }))
    ]),
    transition('* => slide-in-left', [
      style({ opacity: 0, transform: 'translateX(-100%)' }),
      animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' }))
    ]),
    transition('* => slide-in-right', [
      style({ opacity: 0, transform: 'translateX(100%)' }),
      animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' }))
    ]),
    transition('* => zoom-in-show', [
      style({ opacity: 1, transform: 'translateY(-10%) scale(0)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%) scale(1)' }))
    ]),
    transition('* => zoom-out-show', [
      style({ opacity: 1, transform: 'translateY(-10%) scale(2)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%) scale(1)' }))
    ]),
    transition('* => hide', [animate('200ms ease-in', style({ opacity: 0 }))])
  ])
];

export const SlideInOutTop = [
  trigger('slideInTop', [
    transition(':enter', [
      style({ opacity: 1, transform: 'translateY(-100%)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%)' }))
    ]),
    transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(-100%)' }))])
  ])
];

export const SlideInOutBottom = [
  trigger('slideInBottom', [
    transition(':enter', [
      style({ opacity: 1, transform: 'translateY(100%)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%)' }))
    ]),
    transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(100%)' }))])
  ])
];

export const SlideInOutLeft = [
  trigger('slideInLeft', [
    transition(':enter', [
      style({ opacity: 1, transform: 'translateX(-100%)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' }))
    ]),
    transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' }))])
  ])
];

export const SlideInOutRight = [
  trigger('slideInRight', [
    transition(':enter', [
      style({ opacity: 1, transform: 'translateX(100%)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' }))
    ]),
    transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))])
  ])
];

export const ZoomInOut = [
  trigger('zoomIn', [
    state('show', style({ opacity: 1 })),
    state('hide', style({ opacity: 0 })),
    transition('* => show', [
      style({ opacity: 1, transform: 'translateY(-10%) scale(0)' }),
      animate('1000ms ease-in', style({ opacity: 1, transform: 'translateY(0%) scale(1)' }))
    ]),
    transition('* => hide', [animate('2000ms ease-in', style({ opacity: 0, transform: 'translateY(-10%) scale(0)' }))])
  ])
  /*trigger('zoomIn', [
  		transition(':enter', [
	        style({opacity: 1, transform: 'translateY(-10%) scale(0)'}),
	        animate('1000ms ease-in', style({opacity:1, transform: 'translateY(0%) scale(1)'}))
	      ]),
	      transition(':leave', [
	        animate('500ms ease-in', style({opacity:0, transform: 'translateY(100%)'}))
	      ])
  	])*/
];

export const AnimateProgress = [
  trigger('progress', [
    transition(':enter', [
      style({ opacity: 1, width: '0%' }),
      animate('1000ms ease-in', style({ opacity: 1, width: '{{width}}' }))
    ])
  ])
];
