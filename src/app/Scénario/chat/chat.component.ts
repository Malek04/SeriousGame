import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import scenario from '../file/scenario1.json';
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
  scenario: GameStep[] = [];
  currentIndex = 0;
  chatHistory: any[] = [];
  selectedOption: string | null = null;
  showFeedback = false;
  feedbackMessage = '';
  selectedOptions: { [key: number]: Set<string> } = {};

  profileImages: { [key: string]: string } = {
    mme_monia: 'assets/monia.png',
    me: 'assets/doc.png',
  };

  constructor(private http: HttpClient, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.scenario = scenario as GameStep[];
    this.playNext();
  }

  async playNext(): Promise<void> {
    const step = this.scenario[this.currentIndex];
    if (!step) return;

    if (step.role === 'game') {
      this.chatHistory.push({ type: 'question', data: step });
    } else {
      const message = {
        type: 'message',
        from: step.role,
        text: '',
        partial: true,
        imageUrl: this.profileImages[step.role],
      };
      this.chatHistory.push(message);

      // Wait before simulating typing (show typing dots)
      await new Promise((res) => setTimeout(res, 1000));

      // Instantly show full message after delay
      message.text = step.message ?? '';
      message.partial = false;

      this.cdRef.detectChanges();

      this.currentIndex++;
      setTimeout(() => this.playNext(), 1000);
    }
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
      }, 3000);
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
