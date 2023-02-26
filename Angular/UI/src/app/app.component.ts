import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AppSharedService } from './app-shared.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UpdateUserComponent } from './update-user/update-user.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { MatCardModule } from '@angular/material/card';
import { AddUserComponent } from './add-user/add-user.component';
import { MatToolbarModule } from '@angular/material/toolbar';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule, MatToolbarModule, MatIconModule,
    MatProgressSpinnerModule, MatDialogModule, MatPaginatorModule, MatTableModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  displayedColumns: string[] = ['id', 'name', 'button'];
  dataSource!: MatTableDataSource<any>;
  users!: any[];
  newUser = new FormControl('');
  loader = false;
  filterOptions = [{ label: 'Id', value: 'id' }, { label: 'Name', value: 'name' }];
  selectedFilter = new FormControl('');
  enteredFilter = new FormControl('');
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  constructor(private appSharedService: AppSharedService, public dialog: MatDialog) { }

  ngOnInit() {
    this.getUsers();
    this.selectedFilter.valueChanges.subscribe(() => {
      this.enteredFilter.reset('');
      setTimeout(() => document.getElementById('filter')?.focus());
    });
    this.enteredFilter.valueChanges.subscribe(
      (value) => {
        const filteredUser = this.users.filter(user => user[this.selectedFilter.value || ''].toString().includes(value));
        this.refreshUsers(filteredUser);
      });
  }

  refreshUsers(users: any[]) {
    this.dataSource = new MatTableDataSource<any>(users);
    this.dataSource.paginator = this.paginator;
  }

  getUsers() {
    this.loader = true;
    this.appSharedService.fetchUsers().pipe(finalize(() => this.loader = false)).subscribe(
      (users: any[]) => {
        this.users = users?.reverse();
        this.refreshUsers(users);
      }
    )
  }

  addUser(event: any) {
    event.preventDefault();
    const name = this.newUser.value;
    if (name) {
      this.appSharedService.addUser(name).subscribe(
        (user) => {
          this.users.unshift(user);
          this.refreshUsers(this.users);
        }
      );
      this.newUser.reset();
    } else {
      this.newUser.markAsTouched();
    }
  }

  openUpdateDialog(user: any): void {
    const dialogRef = this.dialog.open(UpdateUserComponent, {
      data: JSON.parse(JSON.stringify(user))
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.name) {
        this.appSharedService.updateUser(result).subscribe(
          (updatedUser) => {
            this.users = this.users.map(user => {
              if (user.id === updatedUser.id) {
                user.name = updatedUser.name
              }
              return user;
            });
            this.enteredFilter.reset();
            this.selectedFilter.reset();
            this.refreshUsers(this.users);
          }
        );
      }
    });
  }

  openDeleteDialog(selectedUser: any): void {
    const dialogRef = this.dialog.open(DeleteUserComponent, {
      data: selectedUser.name
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appSharedService.deleteUser(selectedUser.id).subscribe(() => {
          this.users = this.users.filter((user) => user.id !== selectedUser.id);
          this.enteredFilter.reset();
          this.selectedFilter.reset();
          this.refreshUsers(this.users);
        });
      }
    });
  }

  openAddDialog(event: any): void {
    event.preventDefault();
    const dialogRef = this.dialog.open(AddUserComponent);

    dialogRef.afterClosed().subscribe(name => {
      if (name) {
        this.appSharedService.addUser(name).subscribe(
          (user) => {
            this.users.unshift(user);
            this.refreshUsers(this.users);
          }
        );
        this.newUser.reset();
      } else {
        this.newUser.markAsTouched();
      }
    });
  }

  export() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.users);
    const workbook: XLSX.WorkBook = { Sheets: { 'data1': worksheet }, SheetNames: ['data1'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data: Blob = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(data, 'data_' + new Date().getTime() + '.xlsx');
  }

}
