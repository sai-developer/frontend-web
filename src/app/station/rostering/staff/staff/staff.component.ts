import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import * as momentzone from 'moment-timezone';
import { ApiService } from '../../../../service/app.api-service';
import { AppService, AuthService } from '../../../../service/app.service';
import { AppUrl } from '../../../../service/app.url-service';
import { MatDialog } from '@angular/material';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertComponent } from 'app/alert/alert.component';
import { CommonData } from '../../../../service/common-data';


@Component({
  selector: 'staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})

//modal box component
export class StaffComponent implements OnInit {

  
  validation: any = {};
  roles: any[] = [];
  staff: any = {};
  zone = 'Europe/Dublin';
  currentStation: any;
  stationId = 3;
  userId = 1;
  selectedRole: any = '';
  showPassword = false;
  showPass: Boolean = false;
  registerForm: FormGroup;
  selected: any;
  designations = [];
  lastScrollTop = 0;
  st = 0; 

  profileForm = this.fb.group({
    fname: ['', [Validators.required, Validators.minLength(2), Validators.pattern("[A-Za-z]+")]],
    lname: ['', [Validators.required, Validators.pattern("[A-Za-z]+")]],
    email: ['', [Validators.required, Validators.email,]],
    mobile: ['', [Validators.required, Validators.pattern("[0-9||+]+"), Validators.minLength(10)]],
    user: ['', [Validators.required, Validators.pattern("[A-Za-z0-9]+")]],
    designation: ['', [Validators.required]],
    role: ['', [Validators.required]],
    pass: ['', [Validators.required, Validators.minLength(8)]],
  });
  passChange: boolean = true;

  

  constructor(private dialogRef: MatDialogRef<StaffComponent>,
    @Inject(MAT_DIALOG_DATA) public details: any, private services: ApiService, private auth: AuthService,
    private AppUrl: AppUrl, private appService: AppService,
    private dialog: MatDialog, private fb: FormBuilder, private commondata: CommonData) {
    this.currentStation = {
      "id": this.auth.user.userAirportMappingList[0].id,
      "userId": this.auth.user.id, "code": this.auth.user.userAirportMappingList[0].code
    }
    this.designations = this.commondata.designation;
    this.dialogRef.disableClose = true;

  }

  ngOnInit() {
    if (this.details.mode === 'ADD') {
      console.log('inside Add', this.details);
      console.log();
    } else if (this.details.mode === 'EDIT') {
      // this.staffDesignation(this.details.staff.designationId);
      this.editData(this.details.staff)
    } else {
      console.log(this.details)
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  staffDesignation(id) {
    this.roles = [];
    console.log(id);
    // for (let index = 0; index < this.details.Role.length; index++) {
    //   if (id == '1') {
    //     if (this.details.Role[index].id <= 9) {
    //       this.roles.push(this.details.Role[index]);
    //       console.log(this.roles);
    //     }
    //   }
    //   else {
    //     if (this.details.Role[index].id > 9) {
    //       this.roles.push(this.details.Role[index]);
    //       console.log(this.roles)
    //     }
    //   }
    // }

    if (id == '1') {
      this.roles = this.details.Role.filter(
        role => role.id <= 9);
    } else {
      this.roles = this.details.Role.filter(
        role => role.id > 9);
    }
  }

  //function call  while submit  - adding the staff user 
  addStaff() {
    this.dialogRef.close('RELOAD');
    const staff = this.staff;
    const role = [];
    role.push({ id: this.selectedRole });
    staff.userRoleMasterList = role;
    const airport = [];
    airport.push({ id: this.currentStation.id })
    staff.userAirportMappingList = airport;
    this.touchTime(staff);
  
    this.services.create(this.AppUrl.geturlfunction('USER_MASTER_CREATE'), staff).subscribe(res => {
      console.log(res.data)
      const staffName = staff.firstName + ' ' + staff.lastName;
      if (res.status === true) {
        this.closeModal();
        if (res.successMessage.includes('added') === true) {
          this.appService.showToast('STAFF_CREATE', staffName, 'success');
        } else {
          this.appService.showToast('STAFF_CREATE', staffName, 'success');
        }
        this.appService.action.next('REFRESH_' + res.data.id);
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('STAFF_DUPLICATE', staffName, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }

  //function call while submit after editing
  editData(data) {
    console.log(data);
    this.staff.id = data.id;
    this.staff.firstName = data.firstName;
    this.staff.lastName = data.lastName;
    this.staff.email = data.email;
    this.staff.mobile = data.mobile;
    this.staff.userId = data.userId;
    this.staff.designationId = data.designationId;
    this.staff.password = "12345678";
    this.selectedRole = data.userRoleMasterList[0].id;
    this.showPassword = true;
  }


  //function  call for reset the password
  reset() {
    let obj = {
      id: this.staff.id,
      password: "12345678"
    }
    const dialogRef = this.dialog.open(AlertComponent, {
      width: '500px',
      // minHeight: '165px',
      panelClass: 'modelOpen',
      data: {
        text: {
          sub: ' Do you wish to reset the password ?'
        },
        ok: 'YES',
        cancel: 'NO'
      }
    });

//after reset to show the toastmessage
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.services.create(this.AppUrl.geturlfunction('CHANGE_PASSWORD'), obj).subscribe(res => {
         this.appService.showToast('PASSWORD_RESET', " ", 'success');
        })
      }
    })
  }


//while click submit  after  edit and then update
  updateStaff() {
    this.dialogRef.close('RELOAD');
    const role = [];
    role.push({ id: this.selectedRole })
    this.staff.userRoleMasterList = role;
    const airport = [];
    airport.push({ id: this.currentStation.id })
    this.staff.userAirportMappingList = airport;
    this.staff.active = 'Y';
    this.touchTime(this.staff);
    //delete this.staff.password;
    console.log(this.staff.password)
    this.services.create(this.AppUrl.geturlfunction('USER_MASTER_UPDATE'), this.staff).subscribe(res => {
      const staffName = this.staff.firstName + ' ' + this.staff.lastName;
      if (res.status === true) {
        this.closeModal();
        if (res.successMessage.includes('updated') === true) {
          this.appService.showToast('STAFF_UPDATE', staffName, 'success');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
        this.appService.action.next('REFRESH_' + this.staff.id);
      } else {
        if (res.errorMessage.includes('duplicate') === true) {
          this.appService.showToast('STAFF_DUPLICATE', staffName, 'warning');
        } else {
          this.appService.showToast('APP_ERROR', '', 'warning');
        }
      }
    }, error => {
      this.appService.showToast('APP_ERROR', '', 'warning');
    });
  }


  touchTime(data: any) {
    const newData = data;
    newData.active = 'Y';
    newData.createdBy = this.currentStation.userId;
    newData.createdAt = momentzone().tz(this.zone).unix();
    newData.modifiedBy = this.currentStation.userId;
    newData.modifiedAt = momentzone().tz(this.zone).unix();
    return newData;
  }
}
