import { WebXMessage } from '../message';

export abstract class WebXMessageHandler {

  abstract handle(message: WebXMessage): void;

}
