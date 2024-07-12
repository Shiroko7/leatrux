<script lang="ts">
  export let text: string = '';

  let animatedText = '';
  let timeoutId: number | null = null;

  function typeText() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    animatedText = ''; 
    let index = 0;

    function addNextCharacter() {
      if (index < text.length) {
        animatedText += text.charAt(index);
        index++;
        timeoutId = setTimeout(addNextCharacter, 50); 
      }
    }
    addNextCharacter();
  }

  $: text, typeText();
</script>

<span>{animatedText}</span>

