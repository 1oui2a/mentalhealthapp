import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface WellnessTip {
  quote: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class WellnessTipService {
  // Collection of wellness tips
  private wellnessTips: WellnessTip[] = [
    {
      quote: "Happiness depends upon ourselves.",
      author: "Aristoltle"
    },
    {
      quote: "Your mental health is a priority. Your happiness is essential.",
      author: "Unknown"
    },
    {
      quote: "Our bodies are our gardens, to which our wills are gardeners.",
      author: "William Shakespeare"
    },
    {
      quote: "Self-care is not selfish. You cannot serve from an empty vessel.",
      author: "Eleanor Brownn"
    },
    {
      quote: "Your body hears everything your mind says.",
      author: "Naomi Judd"
    },
    {
      quote: "Your body holds deep wisdom. Trust in it. Learn from it. Nourish it. Watch your life transform and be healthy",
      author: "Bella Bleue"
    },
    {
      quote: "What drains your spirit drains your body. What fuels your spirit fuels your body",
      author: "Caroline Myss"
    },
    {
      quote: "I am not afraid of storms, for I am learning how to sail my ship.",
      author: "Louisa May Alcott"
    },
    {
      quote: "The most powerful relationship you will ever have is the relationship with yourself.",
      author: "Unknown"
    },
    {
      quote: "Self-care is not self-indulgence, it is self-preservation.",
      author: "Audre Lorde"
    },
    {
      quote: "Wellness, I came to realize, will not happen by accident. It must be a daily practice, especially for those of us who are more susceptible to the oppressiveness of the world",
      author: "Jenna Wortham"
    },
    {
      quote: "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I will try again tomorrow'.",
      author: "Mary Anne Radmacher"
    }
  ];

  constructor() { }

  /**
   * Get a daily wellness tip
   */
  getDailyTip(): Observable<WellnessTip> {
    // Get a tip based on the day of the month to keep it consistent for the day
    const dayOfMonth = new Date().getDate();
    const index = dayOfMonth % this.wellnessTips.length;
    return of(this.wellnessTips[index]);
  }

  /**
   * Get an alternative tip (for refresh button)
   */
  getAlternativeTip(): Observable<WellnessTip> {
    // Get a random tip
    const randomIndex = Math.floor(Math.random() * this.wellnessTips.length);
    return of(this.wellnessTips[randomIndex]);
  }
}