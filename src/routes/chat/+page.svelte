<script lang="ts">
  import { onMount } from 'svelte';
  import { vectorStore } from '$lib/vectorStore';
  import { createStreamingChatCompletion } from '$lib/embeddings';
  import type { ContextResult } from '$lib/types';

  type Message = {
    role: 'user' | 'assistant';
    content: string;
    context?: ContextResult[];
    isStreaming?: boolean;
  };

  let messages: Message[] = [];
  let newMessage = '';
  let isLoading = false;
  let error: string | null = null;
  let isInitializing = true;

  // Load history and initialize
  onMount(async () => {
    try {
      const savedMessages = localStorage.getItem('dndChatMessages');
      if (savedMessages) {
        messages = JSON.parse(savedMessages);
      }
      
      await vectorStore.initialize();
      isInitializing = false;
    } catch (e) {
      error = `Spellbook failed: ${(e as Error).message}`;
      isInitializing = false;
    }
  });

  // Auto-save messages
  $: {
    try {
      // Only save messages that aren't currently streaming
      const completedMessages = messages.filter(msg => !msg.isStreaming);
      localStorage.setItem('dndChatMessages', JSON.stringify(completedMessages));
    } catch (e) {
      console.error('History preservation spell failed:', e);
    }
  }

  function formatTitle(path: string): string {
    return path
      .split('/').pop()
      ?.replace(/_/g, ' ')
      ?.replace(/\.md$/, '') || 'Ancient Scroll';
  }

  function formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-secondary">$1</em>')
      .replace(/\n/g, '<br>');
  }

  async function sendMessage() {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage;
    newMessage = '';
    isLoading = true;
    error = null;

    // Create temporary updated messages array
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    messages = updatedMessages;

    try {
      // Get relevant context
      const relevantDocs = await vectorStore.findRelevantContext(userMessage);
      const contextResults = relevantDocs.map(doc => ({
        content: doc.content,
        source: doc.path,
        title: formatTitle(doc.path)
      }));

      // Build context string
      const context = contextResults
        .map(doc => `**From ${doc.title}**\n${doc.content}`)
        .join('\n\n');

      // System prompt with rules and context
      const systemPrompt = `You are an ancient D&D sage. Strict rules:
1. NEVER give opinions or modern references
2. ONLY discuss campaign content
3. ALWAYS stay in-character
4. If unsure: "The tomes are unclear..."
5. Never mention being artificial
6. Use **bold** for names/spells, *italics* for lore

Relevant knowledge:
${context}`;

      // Include full conversation history
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      // Add initial assistant message with empty content that will be streamed into
      messages = [
        ...updatedMessages,
        { 
          role: 'assistant',
          content: '',
          context: contextResults,
          isStreaming: true
        }
      ];

      // Use streaming API
      createStreamingChatCompletion(
        apiMessages,
        // On each chunk, update the message content
        (chunk) => {
          messages = messages.map((msg, i) => {
            if (i === messages.length - 1 && msg.role === 'assistant') {
              return {
                ...msg,
                content: msg.content + chunk
              };
            }
            return msg;
          });
        },
        // On error
        (e) => {
          error = `Arcane connection failed: ${e.message}`;
          // Mark message as no longer streaming
          messages = messages.map((msg, i) => {
            if (i === messages.length - 1 && msg.role === 'assistant') {
              return {
                ...msg,
                isStreaming: false
              };
            }
            return msg;
          });
          isLoading = false;
        },
        // On complete
        () => {
          // Mark message as no longer streaming
          messages = messages.map((msg, i) => {
            if (i === messages.length - 1 && msg.role === 'assistant') {
              return {
                ...msg,
                isStreaming: false
              };
            }
            return msg;
          });
          isLoading = false;
        }
      );
    } catch (e) {
      error = `Arcane connection failed: ${(e as Error).message}`;
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-base-300 flex flex-col">
  <!-- Navigation Bar -->
  <nav class="bg-base-200 shadow-md">
    <div class="max-w-3xl mx-auto p-4 flex justify-between items-center">
      <a href="/" class="btn btn-ghost gap-2">
        <span class="text-xl">🏰</span>
        <span>Campaign Archives</span>
      </a>
      <button
        on:click={() => {
          messages = [];
          localStorage.removeItem('dndChatMessages');
        }}
        class="btn btn-sm btn-error"
        title="Clear chat history"
      >
        🧹 Clear History
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="max-w-3xl mx-auto w-full p-4 flex-1 flex flex-col gap-4">
    {#if isInitializing}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center space-y-4">
          <span class="loading loading-infinity loading-lg text-primary"></span>
          <p class="text-base-content/70">
            Decrypting ancient scrolls...
          </p>
        </div>
      </div>
    {:else}
      <!-- Chat Messages Container -->
      <div class="flex-1 overflow-y-auto rounded-box bg-base-200 shadow-lg p-4 max-h-[70vh]">
        {#each messages as message}
          <div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'} mb-4">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-100 border-2 border-primary/10">
                {#if message.role === 'user'}
                  <span class="text-2xl">🧙</span>
                {:else}
                  <span class="text-2xl">📜</span>
                {/if}
              </div>
            </div>
            <div class={`chat-bubble ${message.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-100'}`}>
              <div class="prose prose-sm dark:prose-invert max-w-none">
                {@html formatMessage(message.content)}
                {#if message.isStreaming}
                  <span class="inline-block animate-pulse">▋</span>
                {/if}
              </div>
              {#if message.context && !message.isStreaming}
                <div class="mt-2 pt-2 border-t border-base-content/10 text-xs">
                  <span class="font-bold">Verified in:</span>
                  {#each message.context as doc}
                    <div class="tooltip" data-tip={doc.source.replace('/Public/', '')}>
                      <span class="badge badge-outline badge-xs ml-1">
                        📜 {doc.title}
                      </span>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <!-- Input Form -->
      <form on:submit|preventDefault={sendMessage} class="join w-full shadow-xl">
        <input
          type="text"
          bind:value={newMessage}
          placeholder="Consult the ancient tomes..."
          class="join-item input input-bordered flex-1 bg-base-100 focus:outline-none"
          on:keydown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
        />
        <button
          type="submit"
          class="join-item btn btn-primary gap-2"
          disabled={isLoading || !newMessage.trim()}
        >
          {#if isLoading}
            <span class="loading loading-spinner loading-xs"></span>
          {:else}
            <span class="text-lg">⚡</span>
          {/if}
          {isLoading ? 'Consulting...' : 'Send'}
        </button>
      </form>

      {#if error}
        <div class="toast toast-bottom toast-center">
          <div class="alert alert-error flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
