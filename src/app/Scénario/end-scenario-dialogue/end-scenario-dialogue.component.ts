import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-end-scenario-dialog',
  styleUrls: ['./end-scenario-dialogue.component.css'],
  templateUrl: './end-scenario-dialogue.component.html',
})
export class EndScenarioDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EndScenarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  closeDialog(isCorrect: boolean): void {
    this.dialogRef.close({ isCorrect });
  }
}
