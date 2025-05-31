import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuestionData {
  options: { [key: string]: QuestionOption };
  multipleChoice?: boolean;
}

@Component({
  selector: 'app-question-dialog',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionDialogComponent {
  selectedOptions: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuestionData
  ) {}

  objectKeys = (obj: any): string[] => (obj ? Object.keys(obj) : []);

  onOptionChange(key: string): void {
    //console.log('Selected option changed:', key, this.selectedOptions[key]);
  }

  submitAnswer(): void {
    const selectedKeys = Object.keys(this.selectedOptions).filter(
      (key) => this.selectedOptions[key] === true
    );

    this.dialogRef.close({
      selectedOptions: selectedKeys,
      correct: this.checkAnswer(selectedKeys),
    });
  }

  hasSelectedOptions(): boolean {
    return Object.values(this.selectedOptions).some((value) => value === true);
  }

  checkAnswer(selectedKeys: string[]): boolean {
    const correctAnswers = Object.keys(this.data.options).filter(
      (key) => this.data.options[key].isCorrect
    );

    if (!this.isMultipleChoice()) {
      return (
        selectedKeys.length === 1 && correctAnswers.includes(selectedKeys[0])
      );
    }

    return (
      selectedKeys.every((key) => correctAnswers.includes(key)) &&
      selectedKeys.length === correctAnswers.length
    );
  }

  isMultipleChoice(): boolean {
    return this.data.multipleChoice || false;
  }

  closeDialog(isCorrect: boolean): void {
    this.dialogRef.close({ isCorrect });
  }
}
