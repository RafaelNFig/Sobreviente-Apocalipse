// src/modal-config.ts
import { Dificuldade, TamanhoMapa, CONFIG_DIFICULDADES, CONFIG_TAMANHOS, ConfiguracaoJogo } from './tipos';

export class ModalConfiguracao {
    private modal: HTMLElement;
    private iniciarBtn: HTMLButtonElement;
    private dificuldadeSelecionada: Dificuldade | null = null;
    private tamanhoSelecionado: TamanhoMapa | null = null;

    constructor() {
        this.modal = document.getElementById('dificuldade-modal')!;
        this.iniciarBtn = document.getElementById('iniciar-jogo-btn') as HTMLButtonElement;
        
        this.inicializarEventos();
    }

    private inicializarEventos(): void {
        // Eventos para seleção de dificuldade
        document.querySelectorAll('[data-dificuldade]').forEach(card => {
            card.addEventListener('click', () => {
                this.selecionarDificuldade(card as HTMLElement);
            });
        });

        // Eventos para seleção de tamanho
        document.querySelectorAll('[data-tamanho]').forEach(card => {
            card.addEventListener('click', () => {
                this.selecionarTamanho(card as HTMLElement);
            });
        });

        // Evento do botão iniciar
        this.iniciarBtn.addEventListener('click', () => {
            this.iniciarJogo();
        });
    }

    private selecionarDificuldade(card: HTMLElement): void {
        // Remove seleção anterior
        document.querySelectorAll('[data-dificuldade]').forEach(c => {
            c.classList.remove('selected');
        });

        // Adiciona seleção atual
        card.classList.add('selected');
        this.dificuldadeSelecionada = card.getAttribute('data-dificuldade') as Dificuldade;

        this.verificarSelecaoCompleta();
    }

    private selecionarTamanho(card: HTMLElement): void {
        // Remove seleção anterior
        document.querySelectorAll('[data-tamanho]').forEach(c => {
            c.classList.remove('selected');
        });

        // Adiciona seleção atual
        card.classList.add('selected');
        this.tamanhoSelecionado = card.getAttribute('data-tamanho') as TamanhoMapa;

        this.verificarSelecaoCompleta();
    }

    private verificarSelecaoCompleta(): void {
        if (this.dificuldadeSelecionada && this.tamanhoSelecionado) {
            this.iniciarBtn.disabled = false;
        } else {
            this.iniciarBtn.disabled = true;
        }
    }

    private iniciarJogo(): void {
        if (!this.dificuldadeSelecionada || !this.tamanhoSelecionado) return;

        // Combina as configurações
        const configDificuldade = CONFIG_DIFICULDADES[this.dificuldadeSelecionada];
        const configTamanho = CONFIG_TAMANHOS[this.tamanhoSelecionado];

        const configJogo: ConfiguracaoJogo = {
            ...configDificuldade,
            ...configTamanho
        };

        // Esconde o modal
        this.modal.style.display = 'none';

        // Dispara evento personalizado com as configurações
        const event = new CustomEvent('jogoConfigurado', { 
            detail: { config: configJogo } 
        });
        document.dispatchEvent(event);
    }

    public mostrar(): void {
        this.modal.style.display = 'flex';
        
        // Reset das seleções
        this.dificuldadeSelecionada = null;
        this.tamanhoSelecionado = null;
        this.iniciarBtn.disabled = true;
        
        // Remove seleções visuais
        document.querySelectorAll('[data-dificuldade]').forEach(c => {
            c.classList.remove('selected');
        });
        document.querySelectorAll('[data-tamanho]').forEach(c => {
            c.classList.remove('selected');
        });
    }
}