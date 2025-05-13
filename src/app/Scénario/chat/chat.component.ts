import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import scenario from '../file/scenario1.json';

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

  profileImages: { [key: string]: string } = {
    mme_monia: 'assets/monia.png',
    me: 'assets/doc.png',
    dr_sami: 'assets/sami.png',
  };

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

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
      this.chatHistory.push({ type: 'question', data: step });
      this.cdRef.detectChanges();
      this.scrollToBottom();
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

    await new Promise((res) => setTimeout(res, 300)); // Short delay

    if (step.role === 'narrator') {
      await this.revealMessage(message);
    } else {
      message.partial = false;
      message.displayedText = message.text;
      this.cdRef.detectChanges();
      this.scrollToBottom();
    }

    this.currentIndex++;
    setTimeout(() => this.playNext(), 500); // Delay to pace dialogue
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
      }, 80); // Typing speed
    });
  }

  toggleOption(questionId: number, key: string): void {
    if (!this.selectedOptions[questionId]) {
      this.selectedOptions[questionId] = new Set<string>();
    }

    const optionsSet = this.selectedOptions[questionId];
    if (optionsSet.has(key)) {
      optionsSet.delete(key);
    } else {
      optionsSet.add(key);
    }
  }

  submitMultipleAnswers(): void {
    const step = this.scenario[this.currentIndex];
    if (step.options) {
      const selectedAnswers = Array.from(this.selectedOptions[step.id] || []);
      const feedbacks = selectedAnswers
        .map((answer) => step.options![answer]?.feedback)
        .filter(Boolean);
      const allCorrect = selectedAnswers.every(
        (answer) => step.options![answer]?.isCorrect
      );

      if (!allCorrect) {
        Swal.fire({
          title: 'Vous avez perdu',
          text: 'Réessayez!',
          icon: 'error',
          confirmButtonText: 'Réessayer',
        }).then(() => {
          location.reload();
        });
        return;
      }

      this.chatHistory.push({
        type: 'answer',
        feedback: feedbacks.join(', '),
        correct: allCorrect,
      });

      setTimeout(() => {
        this.selectedOptions[step.id] = new Set();
        this.currentIndex = this.findIndexById(step.next ?? step.id + 1);
        this.playNext();
      }, 2000);
    }
  }

  findIndexById(id: number): number {
    return this.scenario.findIndex((step) => step.id === id);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  isOptionSelected(id: number): boolean {
    return (this.selectedOptions[id]?.size || 0) > 0;
  }
}
