import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import scenario from '../file/scenario1.json';
import { QuestionDialogComponent } from '../questions/questions.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

interface GameStep {
  id: number;
  role: string;
  message?: string;
  question?: string;
  options?: {
    [key: string]: {
      text: string;
      isCorrect: boolean;
      feedback?: string;
    };
  };
  next?: number;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  @ViewChild('chatBox') chatBox!: ElementRef;
  scenario: GameStep[] = [];
  currentIndex = 0;
  chatHistory: any[] = [];
  selectedOptions: { [key: number]: Set<string> } = {};
  pendingQuestion: any = null;

  profileImages: { [key: string]: string } = {
    mme_monia: 'assets/monia.png',
    me: 'assets/doc.png',
  };

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.scenario = scenario as GameStep[];
    this.playNext();
  }

  scrollToBottom(): void {
    try {
      this.chatBox.nativeElement.scrollTop =
        this.chatBox.nativeElement.scrollHeight;
    } catch (err) {}
  }

  async playNext(): Promise<void> {
    const step = this.scenario[this.currentIndex];
    if (!step) return;

    if (step.role === 'game') {
      this.pendingQuestion = { data: step };
      this.cdRef.detectChanges();
      return;
    }

    const message = {
      type: 'message',
      from: step.role,
      text: step.message ?? '',
      displayedText: '',
      partial: true,
      imageUrl: this.profileImages[step.role],
    };

    this.chatHistory.push(message);
    this.cdRef.detectChanges();
    this.scrollToBottom();

    await new Promise((res) => setTimeout(res, 300));

    if (step.role === 'narrator') {
      await this.revealMessage(message);
    } else {
      message.partial = false;
      message.displayedText = message.text;
      this.cdRef.detectChanges();
      this.scrollToBottom();
    }

    this.currentIndex++;
    setTimeout(() => this.playNext(), 500);
  }

  revealMessage(message: any): Promise<void> {
    return new Promise((resolve) => {
      const words = message.text.split(' ');
      let index = 0;

      const interval = setInterval(() => {
        message.displayedText += words[index] + ' ';
        index++;

        if (index === words.length) {
          clearInterval(interval);
          message.partial = false;
          this.cdRef.detectChanges();
          this.scrollToBottom();
          resolve();
        } else {
          this.cdRef.detectChanges();
          this.scrollToBottom();
        }
      }, 200);
    });
  }

  getOptionFeedback(step: GameStep, optionKey: string): string | null {
    const option = step.options?.[optionKey];
    return option?.feedback ?? null;
  }

  openQuestionModal(entry: any): void {
    this.selectedOptions = {};

    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      width: '600px',
      data: entry.data,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.correct !== undefined) {
        const selectedOptionKey = result.selectedOptions[0];
        const step = entry.data;

        this.selectedOptions[step.id] = new Set();
        this.selectedOptions[step.id].add(selectedOptionKey);

        this.chatHistory.push({
          type: 'answer',
          feedback: this.getOptionFeedback(step, selectedOptionKey),
          correct: result.correct,
        });

        this.cdRef.detectChanges();
        this.scrollToBottom();

        setTimeout(() => {
          if (result.correct) {
            this.selectedOptions[step.id] = new Set();
            this.pendingQuestion = null;

            this.currentIndex = this.findIndexById(step.next ?? step.id + 1);
            this.playNext();
          } else {
            this.showRetryAlert();
          }
        }, 1500);
      }
    });
  }

  showRetryAlert(): void {
    Swal.fire({
      title: 'Vous avez perdu 😞',
      text: "Voulez-vous réessayer le jeu ou revenir à la page d'accueil ?",
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Oui, réessayer!',
      cancelButtonText: "Non, revenir à l'accueil!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.reloadGame();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        window.location.href = '';
      }
    });
  }

  reloadGame(): void {
    this.currentIndex = 0;
    this.chatHistory = [];
    this.selectedOptions = {};
    this.playNext();
    window.location.reload();
  }

  findIndexById(id: number): number {
    return this.scenario.findIndex((step) => step.id === id);
  }
}
