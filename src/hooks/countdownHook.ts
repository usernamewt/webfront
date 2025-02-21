import { ref, onMounted, onUnmounted } from 'vue';  
  
export  function useTimer(initialSeconds: number, onTick: (arg0: number) => void) {  
  const seconds = ref(initialSeconds);  
  const timerId:any = ref(null);  
  const isActive = ref(false);  
  
  function startTimer() {  
    if (isActive.value) return;  
    isActive.value = true;  
    timerId.value = setInterval(() => {  
        seconds.value--;  
      if (seconds.value < 0) {  
        resetTimer();
        stopTimer();  
        onTick(0);  
      } else {  
        onTick(seconds.value);  
      }  

    }, 1000);  
  }  
  
  function stopTimer() {  
    if (!isActive.value) return;  
    isActive.value = false;  
    clearInterval(timerId.value);  
    timerId.value = null;  
  }  
  
  function resetTimer() {  
    // stopTimer();  
    seconds.value = initialSeconds;  
  }  
  
  onMounted(() => {  
    if (initialSeconds > 0) {  
      startTimer();  
    }  
  });  
  
  onUnmounted(() => {  
    stopTimer();  
  });  
  
  return {  
    seconds,  
    startTimer,  
    stopTimer,  
    resetTimer,  
  };  
}