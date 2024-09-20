import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

interface GameMessage {
    type: 'FROM_COCOS' | 'FROM_NEXTJS';
    message: 'UPDATE_SCORE' | 'GAME_OVER' | 'INITIATE_PAYMENT';
    payload: any;
}

interface NextJsMessage {
    type: 'FROM_NEXTJS';
    message: 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'REQUEST_OPENED';
    payload: any;
}

@ccclass('GameManager')
export class GameManager extends Component {
    private score: number = 0;

    @property(Label)
    statusLabel: Label | null = null;

    start() {
    }

    onLoad() {
        if (this.statusLabel) {
            this.statusLabel.string = 'onLoad';
        }
        window.addEventListener('message', this.handleMessageFromNextJs.bind(this));
    }

    private onPaymentButtonClicked() {
        console.log('onPaymentButtonClicked');
        this.sendMessageToNextJs({ 
            message: 'INITIATE_PAYMENT', 
            payload: { score: this.score } 
        });
    }

    private handleMessageFromNextJs(event: MessageEvent) {
        if (this.statusLabel) {
            this.statusLabel.string = 'Message from NextJs';
        }
        const data = event.data as NextJsMessage;
        if (data.type === 'FROM_NEXTJS') {
            console.log('Message received from Next.js:', data.message);
            if (this.statusLabel) {
                this.statusLabel.string = data.message;
            }
            switch (data.message) {
            case 'REQUEST_OPENED':
                this.handleOpenSignRequest();
                break;
            case 'PAYMENT_COMPLETED':
                console.log('Payment completed');
                //this.showPaymentCompletedUI(data.payload.amount);
                break;
            case 'PAYMENT_FAILED':
                console.error('Payment failed');
                //this.showPaymentFailedUI(data.payload.error);
                break;
            }
        }
    }

    private handleOpenSignRequest() {
        console.log('Sign request opened in Xumm');
        if (this.statusLabel) {
            this.statusLabel.string = 'Payment request sent. Please check your Xumm app.';
        }
    }

    private sendMessageToNextJs(message: Omit<GameMessage, 'type'>) {
        window.parent.postMessage({ type: 'FROM_COCOS', ...message }, '*');
    }

    public updateScore(points: number) {
        this.score += points;
        this.sendMessageToNextJs({ message: 'UPDATE_SCORE', payload: { score: this.score } });
    }

    public gameOver() {
        this.sendMessageToNextJs({ message: 'GAME_OVER', payload: { finalScore: this.score } });
    }

    private showPaymentCompletedUI(amount: number) {
    // 支払い完了UIを表示するロジック
    }

    private showPaymentFailedUI(error: string) {
    // 支払い失敗UIを表示するロジック
    }
}
