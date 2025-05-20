import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatBox') chatBox!: ElementRef;

  scenario: GameStep[] = [];
  currentIndex = 0;
  chatHistory: any[] = [];
  selectedOptions: { [key: number]: Set<string> } = {};
  pendingQuestion: any = null;
  scenarioKey: string = 'scenario1';

  typingAudio: HTMLAudioElement;
  pafAudio: HTMLAudioElement;
  backgroundAudio: HTMLAudioElement;

  profileImages: { [key: string]: string } = {
    mme_monia: 'assets/character/monia.png',
    me: 'assets/character/doc.png',
    mr_cherif: 'assets/character/Cherif.png',
  };
  displayNames: { [key: string]: string } = {
    mme_monia: 'Madame Monia',
    mr_cherif: 'Monsieur Cherif',
    me: 'Vous',
  };

  scenarioTitles: { [key: string]: string } = {
    scenario1: 'Osteogame',
    scenario2: 'Mission inflammation !',
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.typingAudio = new Audio('assets/sound/typing.mp3');
    this.typingAudio.loop = true;
    this.typingAudio.load();
    this.typingAudio.volume = 1;

    this.pafAudio = new Audio('assets/sound/notification.mp3');
    this.pafAudio.load();
    this.pafAudio.volume = 0.3;

    this.backgroundAudio = new Audio('assets/sound/sound.mp3');
    this.backgroundAudio.loop = true;
    this.backgroundAudio.volume = 0.2;
    this.backgroundAudio.load();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const key = params.get('scenario');
      this.scenarioKey = key ?? 'scenario1';
      this.loadScenario();
    });

    // Start background music after user interaction
    this.playBackgroundSound();
  }

  ngOnDestroy(): void {
    this.backgroundAudio.pause();
    this.backgroundAudio.currentTime = 0;
  }

  playBackgroundSound(): void {
    try {
      this.backgroundAudio.play().catch((err) => {
        console.warn(
          'Background audio may be blocked until user interacts:',
          err
        );
        // Fallback: Play when the user clicks anywhere
        const resumeAudio = () => {
          this.backgroundAudio.play();
          document.removeEventListener('click', resumeAudio);
        };
        document.addEventListener('click', resumeAudio);
      });
    } catch (err) {
      console.error('Failed to play background audio:', err);
    }
  }

  loadScenario(): void {
    this.http
      .get<GameStep[]>(`assets/file/${this.scenarioKey}.json`)
      .subscribe({
        next: (data) => {
          this.scenario = data;
          this.playNext();
        },
        error: (err) => {
          console.error('Failed to load scenario:', err);
          Swal.fire('Erreur', 'Le scénario demandé est introuvable.', 'error');
        },
      });
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

    if (step.role === 'narrator') {
      message.displayedText = message.text;
      message.partial = false;
      this.cdRef.detectChanges();
      this.scrollToBottom();
    } else {
      try {
        this.typingAudio.currentTime = 0;
        await this.typingAudio.play();
      } catch (err) {
        console.warn('Typing audio play blocked:', err);
      }

      await new Promise((res) => setTimeout(res, 1500));

      this.typingAudio.pause();
      this.typingAudio.currentTime = 0;

      try {
        this.pafAudio.currentTime = 0;
        await this.pafAudio.play();
      } catch (err) {
        console.warn('Paf sound blocked:', err);
      }

      message.displayedText = message.text;
      message.partial = false;
      this.cdRef.detectChanges();
      this.scrollToBottom();
    }

    this.currentIndex++;
    setTimeout(() => this.playNext(), 500);
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

        this.selectedOptions[step.id] = new Set([selectedOptionKey]);

        this.chatHistory.push({
          type: 'answer',
          feedback: this.getOptionFeedback(step, selectedOptionKey),
          correct: result.correct,
        });

        this.cdRef.detectChanges();
        this.scrollToBottom();

        setTimeout(() => {
          if (result.correct) {
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
    this.loadScenario();
    window.location.reload();
  }

  findIndexById(id: number): number {
    return this.scenario.findIndex((step) => step.id === id);
  }

  get scenarioTitle(): string {
    return this.scenarioTitles[this.scenarioKey] ?? 'Scénario inconnu';
  }
}
