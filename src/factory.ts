import { BigDecimal, BigInt} from "@graphprotocol/graph-ts";
import {
  QuestionCreated
} from "../generated/Factory/Factory"
import { Game, Question, Market } from "../generated/schema"
import { GameQuestion } from '../generated/templates'

let ZERO_BI = BigInt.fromI32(0);
let ZERO_BD = BigDecimal.fromString("0");
let HUNDRED_BD = BigDecimal.fromString("100");

export function handleQuestionCreated(event: QuestionCreated): void {
  // Dynamically index all new questions
  GameQuestion.create(event.params.questionAddress)
  
  let game = Game.load(event.params.gameID.toHexString())
  if(game == null){
    game = new Game(event.params.gameID.toHexString())
    game.createdAt = event.block.timestamp
    game.save()
  }
  
  let question = new Question(event.params.questionID.toHexString())
  question.address = event.params.questionAddress.toHexString()
  question.game = game.id
  question.createdAt = event.block.timestamp
  question.save()

  let market = Market.load("1");
  if (market == null) {
    market = new Market("1");
    market.paused = false;
    market.totalUsers = ZERO_BI;
    market.totalBets = ZERO_BI;
    market.totalBetA = ZERO_BI;
    market.totalBetB = ZERO_BI;
    market.totalMoney = ZERO_BD;
    market.totalBetAAmount = ZERO_BD;
    market.totalBetBAmount = ZERO_BD;
    market.totalTreasury = ZERO_BD;
    market.totalBetsClaimed = ZERO_BI;
    market.totalMoneyClaimed = ZERO_BD;
    market.winRate = HUNDRED_BD;
    market.averageMoney = ZERO_BD;
    market.netMoney = ZERO_BD;
    market.save();
  }
}

