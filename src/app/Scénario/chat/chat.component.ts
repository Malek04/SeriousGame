import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import scenario from '../file/scenario1.json';

interface GameStep {
  id: number;
  role: string;
  message?: string;
  question?: string;
  options?: {
    [key: string]:
      | {
          text: string;
          isCorrect: boolean;
          feedback?: string;
        }
      | undefined;
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
  selectedOptions: { [key: number]: Set<string> } = {}; // Track selected options for each question

  // Define profile images for each character
  profileImages: { [key: string]: string } = {
    mme_monia: 'assets/monia.png',
    me: 'assets/doc.png',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.scenario = scenario;
    this.playNext();
  }

  async playNext(): Promise<void> {
    const step = this.scenario[this.currentIndex];
    console.log(step); // Debug log to check the step data

    if (!step) return; // Ensure step exists

    if (step.role === 'game') {
      // Add the question to the chat history
      this.chatHistory.push({ type: 'question', data: step });
    } else {
      // Add regular message to the chat history
      const message = {
        type: 'message',
        from: step.role,
        text: '',
        partial: true,
        imageUrl: this.profileImages[step.role],
      };
      this.chatHistory.push(message);
      await this.typeText(step.message || '', message);
      message.partial = false;
      this.currentIndex++;
      setTimeout(() => this.playNext(), 1000);
    }
  }

  async typeText(
    fullText: string,
    messageObj: { text: string }
  ): Promise<void> {
    const chars = fullText.split('');
    for (let i = 0; i < chars.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      messageObj.text += chars[i];
    }
  }

  toggleOption(questionId: number, key: string): void {
    if (!this.selectedOptions[questionId]) {
      this.selectedOptions[questionId] = new Set<string>(); // Initialize the Set if not present
    }

    if (this.selectedOptions[questionId].has(key)) {
      this.selectedOptions[questionId].delete(key);
    } else {
      this.selectedOptions[questionId].add(key);
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

      // Push the answers with feedback
      this.chatHistory.push({
        type: 'answer',
        feedback: feedbacks.join(', '),
        correct: allCorrect,
      });

      // Logic to move to the next step
      setTimeout(() => {
        this.selectedOptions[step.id] = new Set(); // Reset selected options
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
}
