<script lang="ts">
    import type { PageData } from "./$types";
    import { onMount } from "svelte";

    let { data }: { data: PageData } = $props();

    // Theme state
    let isDark = $state(true);

    // Initialize theme from localStorage
    onMount(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            isDark = savedTheme === "dark";
        } else {
            // Default to system preference
            isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
    });

    // Toggle theme
    function toggleTheme() {
        isDark = !isDark;
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    // Group links by category
    const groupedLinks = $derived(
        data.links.reduce(
            (acc, link) => {
                if (!acc[link.category]) {
                    acc[link.category] = [];
                }
                acc[link.category].push(link);
                return acc;
            },
            {} as Record<string, typeof data.links>,
        ),
    );

    // Sort categories alphabetically
    const categories = $derived(Object.keys(groupedLinks).sort());
</script>

<svelte:head>
    <title>N2</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="container" class:dark={isDark}>
    {#if categories.length === 0}
        <div class="empty-state">
            <p>暂无导航链接，请检查飞书配置</p>
        </div>
    {:else}
        <div class="content">
            {#each categories as category}
                <section class="category-section">
                    <h2 class="category-title">
                        <span class="category-indicator"></span>
                        {category}
                    </h2>
                    <div class="nav-grid">
                        {#each groupedLinks[category] as link}
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="nav-card"
                            >
                                <div class="card-content">
                                    {#if link.icon}
                                        <img
                                            src={link.icon}
                                            alt={link.name}
                                            class="nav-icon"
                                        />
                                    {:else}
                                        <div class="nav-icon-placeholder">
                                            {link.name.charAt(0).toUpperCase()}
                                        </div>
                                    {/if}
                                    <div class="nav-info">
                                        <h3 class="nav-name">{link.name}</h3>
                                        <p class="nav-url">{link.url}</p>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {/if}

    <!-- Fixed theme toggle button at bottom right -->
    <button
        class="theme-toggle-fixed"
        onclick={toggleTheme}
        aria-label="Toggle theme"
    >
        {#if isDark}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        {:else}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                ></path>
            </svg>
        {/if}
    </button>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        transition: background 0.3s ease;
    }

    .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        transition: all 0.3s ease;
    }

    /* Light mode styles */
    .container:not(.dark) :global(body) {
        background: linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%);
    }

    /* Fixed theme toggle button at bottom right */
    .theme-toggle-fixed {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        width: 3.5rem;
        height: 3.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
    }

    .theme-toggle-fixed:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .container:not(.dark) .theme-toggle-fixed {
        background: rgba(255, 255, 255, 0.9);
        border-color: rgba(0, 0, 0, 0.1);
        color: #1f2937;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .container:not(.dark) .theme-toggle-fixed:hover {
        background: white;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .empty-state {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 1rem;
        padding: 4rem 2rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.125rem;
    }

    .container:not(.dark) .empty-state {
        background: rgba(255, 255, 255, 0.8);
        border-color: rgba(0, 0, 0, 0.1);
        color: rgba(31, 41, 55, 0.9);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 3rem;
    }

    .category-section {
        animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .category-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 1.75rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1.5rem 0;
    }

    .container:not(.dark) .category-title {
        color: #1f2937;
    }

    .category-indicator {
        width: 4px;
        height: 2rem;
        background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
        border-radius: 2px;
    }

    .nav-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .nav-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 1rem;
        padding: 1.5rem;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .container:not(.dark) .nav-card {
        background: rgba(255, 255, 255, 0.8);
        border-color: rgba(0, 0, 0, 0.1);
    }

    .nav-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0) 100%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .nav-card:hover {
        transform: translateY(-4px);
        border-color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .container:not(.dark) .nav-card:hover {
        background: white;
        border-color: rgba(99, 102, 241, 0.3);
        box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
    }

    .nav-card:hover::before {
        opacity: 1;
    }

    .card-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
        z-index: 1;
    }

    .nav-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        object-fit: cover;
        flex-shrink: 0;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-icon-placeholder {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
        color: white;
        flex-shrink: 0;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-info {
        flex: 1;
        min-width: 0;
    }

    .nav-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        margin: 0 0 0.25rem 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.3s ease;
    }

    .container:not(.dark) .nav-name {
        color: #1f2937;
    }

    .nav-card:hover .nav-name {
        color: #fbbf24;
    }

    .container:not(.dark) .nav-card:hover .nav-name {
        color: #6366f1;
    }

    .nav-url {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.3s ease;
    }

    .container:not(.dark) .nav-url {
        color: rgba(31, 41, 55, 0.6);
    }

    .nav-card:hover .nav-url {
        color: rgba(255, 255, 255, 0.9);
    }

    .container:not(.dark) .nav-card:hover .nav-url {
        color: rgba(31, 41, 55, 0.8);
    }

    @media (max-width: 768px) {
        .container {
            padding: 2rem 1rem;
        }

        .title {
            font-size: 2.5rem;
        }

        .subtitle {
            font-size: 1rem;
        }

        .nav-grid {
            grid-template-columns: 1fr;
        }

        .category-title {
            font-size: 1.5rem;
        }
    }
</style>
