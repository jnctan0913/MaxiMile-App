import { useState, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COACH_MARK_KEY = '@maximile_recommend_coach_mark_done';

interface SpotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseCoachMarkOptions {
  enabled: boolean;
  refs: React.RefObject<View>[];
  scrollViewRef: React.RefObject<ScrollView>;
  scrollOffsets: number[];
}

interface UseCoachMarkResult {
  coachMarkVisible: boolean;
  currentStep: number;
  spotRect: SpotRect | null;
  advance: () => void;
  dismiss: () => void;
}

export function useCoachMark({
  enabled,
  refs,
  scrollViewRef,
  scrollOffsets,
}: UseCoachMarkOptions): UseCoachMarkResult {
  const [coachMarkVisible, setCoachMarkVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);
  const hasChecked = useRef(false);

  const measureStep = (stepIndex: number) => {
    const delay = 350;

    if (stepIndex === 2) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } else {
      scrollViewRef.current?.scrollTo({ y: scrollOffsets[stepIndex], animated: true });
    }

    setTimeout(() => {
      refs[stepIndex].current?.measureInWindow((x, y, width, height) => {
        if (width === 0) return;
        setSpotRect({ x, y, width, height });
        setCoachMarkVisible(true);
      });
    }, delay);
  };

  useEffect(() => {
    if (!enabled || hasChecked.current) return;

    const check = async () => {
      const value = await AsyncStorage.getItem(COACH_MARK_KEY);
      hasChecked.current = true;
      if (value === null) {
        measureStep(0);
      }
    };

    check();
  }, [enabled]);

  const advance = () => {
    if (currentStep < 2) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      measureStep(nextStep);
    } else {
      dismiss();
    }
  };

  const dismiss = () => {
    AsyncStorage.setItem(COACH_MARK_KEY, 'true');
    setCoachMarkVisible(false);
  };

  return { coachMarkVisible, currentStep, spotRect, advance, dismiss };
}
