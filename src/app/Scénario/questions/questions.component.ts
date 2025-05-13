import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-question-dialog',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css'],
})
export class QuestionDialogComponent {
  // Utilisé pour suivre les options sélectionnées via checkbox native
  selectedOptions: { [key: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  hasSelectedOptions(): boolean {
    return Object.values(this.selectedOptions).some((value) => value === true);
  }

  submitAnswer(): void {
    const correctAnswers = this.objectKeys(this.data.options).filter(
      (key) => this.data.options[key].isCorrect
    );

    const selectedAnswers = this.objectKeys(this.selectedOptions).filter(
      (key) => this.selectedOptions[key]
    );

    const allSelectedCorrect = selectedAnswers.every((answer) =>
      correctAnswers.includes(answer)
    );
    const allCorrectSelected = correctAnswers.every((answer) =>
      selectedAnswers.includes(answer)
    );

    const isCorrect = allSelectedCorrect && allCorrectSelected;

    this.closeDialog(isCorrect);
  }

  closeDialog(isCorrect: boolean): void {
    this.dialogRef.close({
      correct: isCorrect,
      feedback: isCorrect ? 'Bonne réponse!' : 'Mauvaise réponse.',
    });
  }
}
