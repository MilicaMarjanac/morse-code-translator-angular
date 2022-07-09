import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-morse-code-main',
  templateUrl: './morse-code-main.component.html',
  styleUrls: ['./morse-code-main.component.css']
})
export class MorseCodeMainComponent implements OnInit {
  @ViewChild('inputValue', { static: false })
  inputValue: ElementRef<HTMLInputElement>;

  public isPlaying: boolean = false;
  public isClear: boolean = true;

  private wpm: number; //words per minute
  private unit: number;
  private intraCharacterSpace: number;
  private interCharacterSpace: number;
  private wordSpace: number;

  private inputTextToMorseChars: string[] = [];
  public code: string = '';

  private dot: HTMLAudioElement;
  private dash: HTMLAudioElement;

  private alphabetCharactersToSounds: { [key: string]: HTMLAudioElement[] } = {};

  private inputText: string[];
  private charIndex: number;

  private soundsArray: HTMLAudioElement[];
  private soundIndex: number;
  public dropdownItems: number[] = [10, 20, 40];

  constructor() {}

  ngOnInit(): void {
    this.dot = new Audio('assets/audio/dot.mp3');
    this.dash = new Audio('assets/audio/dash.mp3');
    this.setSounds(this.dot);
    this.setSounds(this.dash);
    this.calculateWPM(this.dropdownItems[0]);

    this.alphabetCharactersToSounds = {
      a: [this.dot, this.dash],
      b: [this.dash, this.dot, this.dot, this.dot],
      c: [this.dash, this.dot, this.dash, this.dot],
      d: [this.dash, this.dot, this.dot],
      e: [this.dot],
      f: [this.dot, this.dot, this.dash, this.dot],
      g: [this.dash, this.dash, this.dot],
      h: [this.dot, this.dot, this.dot, this.dot],
      i: [this.dot, this.dot],
      j: [this.dot, this.dash, this.dash, this.dash],
      k: [this.dash, this.dot, this.dash],
      l: [this.dot, this.dash, this.dot, this.dot],
      m: [this.dash, this.dash],
      n: [this.dash, this.dot],
      o: [this.dash, this.dash, this.dash],
      p: [this.dot, this.dash, this.dash, this.dot],
      q: [this.dash, this.dash, this.dot, this.dash],
      r: [this.dot, this.dash, this.dot],
      s: [this.dot, this.dot, this.dot],
      t: [this.dash],
      u: [this.dot, this.dot, this.dash],
      v: [this.dot, this.dot, this.dot, this.dash],
      w: [this.dot, this.dash, this.dash],
      x: [this.dash, this.dot, this.dot, this.dash],
      y: [this.dash, this.dot, this.dash, this.dash],
      z: [this.dash, this.dash, this.dot, this.dot],
      '0': [this.dash, this.dash, this.dash, this.dash, this.dash],
      '1': [this.dot, this.dash, this.dash, this.dash, this.dash],
      '2': [this.dot, this.dot, this.dash, this.dash, this.dash],
      '3': [this.dot, this.dot, this.dot, this.dash, this.dash],
      '4': [this.dot, this.dot, this.dot, this.dot, this.dash],
      '5': [this.dot, this.dot, this.dot, this.dot, this.dot],
      '6': [this.dash, this.dot, this.dot, this.dot, this.dot],
      '7': [this.dash, this.dash, this.dot, this.dot, this.dot],
      '8': [this.dash, this.dash, this.dash, this.dot, this.dot],
      '9': [this.dash, this.dash, this.dash, this.dash, this.dot],
      '.': [this.dot, this.dash, this.dot, this.dash, this.dot, this.dash],
      ',': [this.dash, this.dash, this.dot, this.dot, this.dash, this.dash],
      '?': [this.dot, this.dot, this.dash, this.dash, this.dot, this.dot],
      "'": [this.dot, this.dash, this.dash, this.dash, this.dash, this.dot],
      '!': [this.dash, this.dot, this.dash, this.dot, this.dash, this.dash],
      '(': [this.dash, this.dot, this.dash, this.dash, this.dot],
      ')': [this.dash, this.dot, this.dash, this.dash, this.dot, this.dash],
      ':': [this.dash, this.dash, this.dash, this.dot, this.dot, this.dot],
      ';': [this.dash, this.dot, this.dash, this.dot, this.dash, this.dot],
      '+': [this.dot, this.dash, this.dot, this.dash, this.dot],
      '-': [this.dash, this.dot, this.dot, this.dot, this.dot, this.dash],
      _: [this.dot, this.dot, this.dash, this.dash, this.dot, this.dash],
      '"': [this.dot, this.dash, this.dot, this.dot, this.dash, this.dot],
    };
  }

  private setSounds(sound: HTMLAudioElement): void {
    sound.onended = () => {
      if (!this.isClear) {
        timer(this.intraCharacterSpace).subscribe(() => {
          this.playSounds();
        });
      }
    };
  }

  private calculateWPM(speed: number): void {
    this.wpm = speed;
    this.unit = (60 / (50 * this.wpm)) * 1000; //Paris as standard word
    this.intraCharacterSpace = this.unit;
    this.interCharacterSpace = this.unit * 3;
    this.wordSpace = this.unit * 7;
  }

  public chooseDropdownItem(event: any): void {
    this.calculateWPM(event.target.value);
  }

  public translatorInit(): void {
    this.inputTextToMorseChars = this.inputValue.nativeElement.value
      .toLowerCase()
      .split('');
    this.isClear = false;
    this.translator();
  }

  // reusing alphabet characters object for converting alphabet to sounds then sounds to morse signs
  private translator(): void {
    let alphabetCharToAudio: HTMLAudioElement[] | string[] = [];
    let alphabetCharToAudioArr: (HTMLAudioElement | string)[] = [];
    this.inputTextToMorseChars.forEach((char: string) => {
      alphabetCharToAudio = this.alphabetCharactersToSounds[char]
        ? this.alphabetCharactersToSounds[char]
        : ['wordGap'];
      if (alphabetCharToAudio) {
        alphabetCharToAudio.forEach((element: HTMLAudioElement | string) => {
          alphabetCharToAudioArr.push(element);
        });
        alphabetCharToAudioArr.push('unitGap');
      }
    });
    this.audioArrayToStringCode(alphabetCharToAudioArr);
  }

  // convert sounds to morse code signs
  private audioArrayToStringCode(
    audioArray: (HTMLAudioElement | string)[]): void {
    let morseChars: string = '';
    let morseSign: string = '';
    audioArray.forEach((element: HTMLAudioElement | string) => {
      if (typeof element === 'string') {
        morseSign = element === 'wordGap' ? '/' : ' ';
      } else {
        let sound = element.src.split('/')[element.src.split('/').length - 1];
        morseSign = sound === 'dot.mp3' ? '.' : '-';
      }
      morseChars += morseSign;
    });
    this.code = morseChars;
  }

  public submit(): void {
    this.inputText = this.inputValue.nativeElement.value.trim().toLowerCase().split('');
    this.charIndex = 0;
    this.isPlaying = true;
    this.moreCharacters();
  }

  public clear(): void {
    this.inputValue.nativeElement.value = '';
    this.code = '';
    this.isClear = true;
    this.isPlaying = false;
  }

  // check for next character in text
  private moreCharacters(): void {
    if (this.charIndex < this.inputText.length) {
      this.charIndex += 1;
      this.soundsArray = this.alphabetCharactersToSounds[this.inputText[this.charIndex - 1]];
      this.soundIndex = 0;
      if (this.soundsArray == undefined) {
        timer(this.wordSpace).subscribe(() => {
          this.moreCharacters();
        });
      } else {
        this.playSounds();
      }
    } else {
      this.isPlaying = false;
    }
  }

  // convert text to morse code sounds
  private playSounds(): void {
    if (this.soundIndex < this.soundsArray.length) {
      this.soundIndex += 1;
      this.soundsArray[this.soundIndex - 1].play();
    } else {
      timer(this.interCharacterSpace).subscribe(() => {
        this.moreCharacters();
      });
    }
  }
}
