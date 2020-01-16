import { Component, OnInit,Inject } from '@angular/core';
import { MatBottomSheetRef,MAT_BOTTOM_SHEET_DATA} from '@angular/material';

@Component({
  selector: 'app-final-approach',
  templateUrl: './final-approach.component.html',
  styleUrls: ['./final-approach.component.scss']
})
export class FinalApproachComponent implements OnInit {

  constructor(private bottomSheetRef: MatBottomSheetRef<FinalApproachComponent>,@Inject(MAT_BOTTOM_SHEET_DATA) public details: any) { }

  // on click outside modal, the modal should not close
  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
  ngOnInit() {
  }

  // closing modal on button click 
  closeModel() {
    this.bottomSheetRef.dismiss();
  }
}
