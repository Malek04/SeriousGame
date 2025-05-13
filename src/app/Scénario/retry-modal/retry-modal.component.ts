import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-retry-modal',
  template: `
    <h2 class="modal-title">Réessayez</h2>
    <p>Il y a des réponses incorrectes. Voulez-vous réessayer ?</p>
    <button mat-button (click)="closeDialog()">Réessayer</button>
  `,
  styles: [
    `
      /* Ensuring the modal content has a solid background */
      ::ng-deep .mat-dialog-container {
        background-color: white !important; /* Solid white background */
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Shadow for better visibility */
      }

      /* Dark backdrop behind the modal */
      ::ng-deep .mat-dialog-backdrop {
        background-color: rgba(0, 0, 0, 0.7) !important; /* Dark backdrop */
      }

      .modal-title {
        text-align: center;
        font-size: 1.5rem;
        color: black;
      }

      p {
        text-align: center;
        font-size: 1.2rem;
        color: black;
      }

      button {
        display: block;
        margin: 20px auto;
        color: black;
      }
    `,
  ],
})
export class RetryModalComponent {
  constructor(public dialogRef: MatDialogRef<RetryModalComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
