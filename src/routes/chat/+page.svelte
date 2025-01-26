<script lang="ts">
  import { onMount } from 'svelte';
  import { vectorStore } from '$lib/vectorStore';
  import { createChatCompletion } from '$lib/embeddings';
  import type { ContextResult } from '$lib/types';

  type Message = {
    role: 'user' | 'assistant';
    content: string;
    context?: ContextResult[];
  };

  let messages: Message[] = [];
  let newMessage = '';
  let isLoading = false;
  let error: string | null = null;
  let isInitializing = true;

  onMount(async () => {
    try {
      await vectorStore.initialize();
      isInitializing = false;
    } catch (e) {
      error = `Failed to initialize: ${(e as Error).message}`;
      isInitializing = false;
    }
  });

  function formatTitle(path: string): string {
    return path
      .split('/').pop()
      ?.replace(/_/g, ' ')
      ?.replace(/\.md$/, '') || 'Unknown';
  }

  async function sendMessage() {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = newMessage;
    newMessage = '';
    isLoading = true;
    error = null;

    messages = [...messages, { role: 'user', content: userMessage }];

    try {
      const relevantDocs = await vectorStore.findRelevantContext(userMessage);
      const contextResults = relevantDocs.map(doc => ({
        content: doc.content,
        source: doc.path,
        title: formatTitle(doc.path)
      }));

      const context = contextResults
        .map(doc => `**From ${doc.title}**\n${doc.content}`)
        .join('\n\n');

      const systemPrompt = `You are a D&D sage. Strict rules:
1. NEVER give personal opinions
2. NEVER discuss unrelated topics
3. ALWAYS stay in-character
4. If unsure: "The ancient tomes are unclear..."
5. Never mention being AI
6. Use **bold** and *italics*

Relevant context:
${context}`;

      const response = await createChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);

      messages = [
        ...messages,
        { 
          role: 'assistant',
          content: response,
          context: contextResults
        }
      ];
    } catch (e) {
      error = `Error: ${(e as Error).message}`;
    } finally {
      isLoading = false;
    }
  }

  function formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-secondary">$1</em>')
      .replace(/\n/g, '<br>');
  }
</script>

<div class="min-h-screen bg-base-300 flex flex-col">
  <!-- Navigation Bar -->
  <nav class="bg-base-200 shadow-md">
    <div class="max-w-3xl mx-auto p-4">
      <a href="/" class="btn btn-ghost gap-2">
        <span class="text-xl">🏰</span>
        <span>Campaign Archives</span>
      </a>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="flex-1 max-w-3xl mx-auto w-full p-4 flex flex-col gap-4">
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
              </div>
              {#if message.context}
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

        {#if isLoading}
          <div class="chat chat-start">
            <div class="chat-image avatar">
              <div class="w-10 rounded-full bg-base-100 border-2 border-primary/10">
                <span class="text-2xl">📜</span>
              </div>
            </div>
            <div class="chat-bubble bg-base-100">
              <span class="loading loading-dots loading-sm"></span>
            </div>
          </div>
        {/if}
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