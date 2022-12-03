import { BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {
  Pause,
  Unpause,
  PlaceBetA,
  PlaceBetB,
  AnswerSet,
  Claim,
  RewardsCalculated
} from "../generated/templates/GameQuestion/GameQuestion"
import { Market,
  Question,
  User,
  Bet } from "../generated/schema"
import { concat } from "@graphprotocol/graph-ts/helper-functions";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");
let HUNDRED_BD = BigDecimal.fromString("100");
let EIGHT_BD = BigDecimal.fromString("1e8");
let SIX_BD = BigDecimal.fromString("1e6");
let EIGHTEEN_BD = BigDecimal.fromString("1e18");


export function handleBetA(event: PlaceBetA): void {
  log.debug("Tried to bet (A) (questionID: {}).", [event.params.questionID.toHexString()])
  let market = Market.load("1");
  if (market === null) {
    log.error("Tried to query market with bet (A)",[]);
  }else{
    market.totalBets = market.totalBets.plus(ONE_BI);
    market.totalBetA = market.totalBetA.plus(ONE_BI);
    market.totalMoney = market.totalMoney.plus(event.params.amount.divDecimal(SIX_BD));
    market.totalBetAAmount = market.totalBetAAmount.plus(event.params.amount.divDecimal(SIX_BD));
    market.winRate = market.totalBetsClaimed.divDecimal(market.totalBets.toBigDecimal()).times(HUNDRED_BD);
    market.averageMoney = market.totalMoney.div(market.totalBets.toBigDecimal());
    market.netMoney = market.netMoney.minus(event.params.amount.divDecimal(SIX_BD));
    market.save();
  }

  let question = Question.load(event.params.questionID.toHexString());
  if (question === null) {
    log.error("Tried to bet (A) without an existing question (questionID: {}).", [event.params.questionID.toHexString()]);
  }else{
    question.totalBets = question.totalBets.plus(ONE_BI);
    question.totalAmount = question.totalAmount.plus(event.params.amount.divDecimal(SIX_BD));
    question.ABets = question.ABets.plus(ONE_BI);
    question.ABetAmount = question.ABetAmount.plus(event.params.amount.divDecimal(SIX_BD));
    question.save();
  }

  // Fail safe condition in case the user has not been created yet.
  let user = User.load(event.params.sender.toHex());
  if (user === null) {
    user = new User(event.params.sender.toHex());
    user.createdAt = event.block.timestamp;
    user.updatedAt = event.block.timestamp;
    user.block = event.block.number;
    user.totalBets = ZERO_BI;
    user.totalBetA = ZERO_BI;
    user.totalBetB = ZERO_BI;
    user.totalMoney = ZERO_BD;
    user.totalBetAAmount = ZERO_BD;
    user.totalBetBAmount = ZERO_BD;
    user.totalBetsClaimed = ZERO_BI;
    user.totalMoneyClaimed = ZERO_BD;
    user.winRate = HUNDRED_BD;
    user.averageMoney = ZERO_BD;
    user.netMoney = ZERO_BD;
    if(market != null){
      market.totalUsers = market.totalUsers.plus(ONE_BI);
      market.save();
    }
  }
  user.updatedAt = event.block.timestamp;
  user.totalBets = user.totalBets.plus(ONE_BI);
  user.totalBetA = user.totalBetA.plus(ONE_BI);
  user.totalMoney = user.totalMoney.plus(event.params.amount.divDecimal(SIX_BD));
  user.totalBetAAmount = user.totalBetAAmount.plus(event.params.amount.divDecimal(SIX_BD));
  user.winRate = user.totalBetsClaimed.divDecimal(user.totalBets.toBigDecimal()).times(HUNDRED_BD);
  user.averageMoney = user.totalMoney.div(user.totalBets.toBigDecimal());
  user.netMoney = user.netMoney.minus(event.params.amount.divDecimal(SIX_BD));
  user.save();

  let betId = concat(event.params.sender, event.params.questionID).toHex();
  let bet = new Bet(betId);
  if(question != null){
    bet.question = question.id;
  }
  bet.user = user.id;
  bet.hash = event.transaction.hash;
  bet.amount = event.params.amount.divDecimal(SIX_BD);
  bet.position = "A";
  bet.claimed = false;
  bet.createdAt = event.block.timestamp;
  bet.updatedAt = event.block.timestamp;
  bet.block = event.block.number;
  bet.save();
}

export function handleBetB(event: PlaceBetB): void {
  let market = Market.load("1");
  if (market === null) {
    log.error("Tried to query market with bet (B)", []);
  }else{
    market.totalBets = market.totalBets.plus(ONE_BI);
    market.totalBetB = market.totalBetB.plus(ONE_BI);
    market.totalMoney = market.totalMoney.plus(event.params.amount.divDecimal(SIX_BD));
    market.totalBetBAmount = market.totalBetAAmount.plus(event.params.amount.divDecimal(SIX_BD));
    market.winRate = market.totalBetsClaimed.divDecimal(market.totalBets.toBigDecimal()).times(HUNDRED_BD);
    market.averageMoney = market.totalMoney.div(market.totalBets.toBigDecimal());
    market.netMoney = market.netMoney.minus(event.params.amount.divDecimal(SIX_BD));
    market.save();
  }

  let question = Question.load(event.params.questionID.toHexString());
  if (question === null) {
    log.error("Tried to bet (bear) without an existing question (questionID: {}).", [event.params.questionID.toHexString()]);
  }else{
    question.totalBets = question.totalBets.plus(ONE_BI);
    question.totalAmount = question.totalAmount.plus(event.params.amount.divDecimal(SIX_BD));
    question.BBets = question.BBets.plus(ONE_BI);
    question.BBetAmount = question.BBetAmount.plus(event.params.amount.divDecimal(SIX_BD));
    question.save();
  }

  // Fail safe condition in case the user has not been created yet.
  let user = User.load(event.params.sender.toHex());
  if (user === null) {
    user = new User(event.params.sender.toHex());
    user.createdAt = event.block.timestamp;
    user.updatedAt = event.block.timestamp;
    user.block = event.block.number;
    user.totalBets = ZERO_BI;
    user.totalBetA = ZERO_BI;
    user.totalBetB = ZERO_BI;
    user.totalMoney = ZERO_BD;
    user.totalBetAAmount = ZERO_BD;
    user.totalBetBAmount = ZERO_BD;
    user.totalBetsClaimed = ZERO_BI;
    user.totalMoneyClaimed = ZERO_BD;
    user.winRate = HUNDRED_BD;
    user.averageMoney = ZERO_BD;
    user.netMoney = ZERO_BD;
    if(market != null){
      market.totalUsers = market.totalUsers.plus(ONE_BI);
      market.save();
    }
  }
  user.updatedAt = event.block.timestamp;
  user.totalBets = user.totalBets.plus(ONE_BI);
  user.totalBetB = user.totalBetB.plus(ONE_BI);
  user.totalMoney = user.totalMoney.plus(event.params.amount.divDecimal(SIX_BD));
  user.totalBetBAmount = user.totalBetBAmount.plus(event.params.amount.divDecimal(SIX_BD));
  user.winRate = user.totalBetsClaimed.divDecimal(user.totalBets.toBigDecimal()).times(HUNDRED_BD);
  user.averageMoney = user.totalMoney.div(user.totalBets.toBigDecimal());
  user.netMoney = user.netMoney.minus(event.params.amount.divDecimal(SIX_BD));
  user.save();

  let betId = concat(event.params.sender, event.params.questionID).toHex();
  let bet = new Bet(betId);
  if(question != null){
    bet.question = question.id;
  }
  bet.user = user.id;
  bet.hash = event.transaction.hash;
  bet.amount = event.params.amount.divDecimal(SIX_BD);
  bet.position = "B";
  bet.claimed = false;
  bet.createdAt = event.block.timestamp;
  bet.updatedAt = event.block.timestamp;
  bet.block = event.block.number;
  bet.save();
}

export function handleAnswerSet(event: AnswerSet): void {
  let question = Question.load(event.params.questionID.toHexString());
  if (question === null) {
    log.error("Tried to end question without an existing questionID (epoch: {}).", [event.params.questionID.toHexString()]);
  }else{
    question.closeBlock = event.block.number;
    question.ended = true;
  
    if (event.params.option == 2) {
      question.position = "C";
    } else if (event.params.option == 1) {
      question.position = "B";
    } else if (event.params.option == 0) {
      question.position = "A";
    } else {
      question.position = null;
    }
    question.failed = false;
  
    question.save();
  }
}

export function handleClaim(event: Claim): void {
  let betId = concat(event.params.sender, event.params.questionID).toHex();
  let bet = Bet.load(betId);
  if (bet === null) {
    log.error("Tried to query bet without an existing ID (betId: {})", [betId]);
  }else{
    bet.claimed = true;
    bet.claimedAt = event.block.timestamp;
    bet.claimedBlock = event.block.number;
    bet.claimedHash = event.transaction.hash;
    bet.claimedMoney = event.params.amount.divDecimal(SIX_BD);
    bet.claimedNetMoney = event.params.amount.divDecimal(SIX_BD).minus(bet.amount);
    bet.updatedAt = event.block.timestamp;
    bet.save();
  }

  let user = User.load(event.params.sender.toHex());
  if (user === null) {
    log.error("Tried to query user without an existing ID (address: {})", [event.params.sender.toHex()]);
  }else{
    user.totalBetsClaimed = user.totalBetsClaimed.plus(ONE_BI);
    user.totalMoneyClaimed = user.totalMoneyClaimed.plus(event.params.amount.divDecimal(SIX_BD));
    user.winRate = user.totalBetsClaimed.divDecimal(user.totalBets.toBigDecimal()).times(HUNDRED_BD);
    user.netMoney = user.netMoney.plus(event.params.amount.divDecimal(SIX_BD));
    user.save();
  }

  let market = Market.load("1");
  if (market === null) {
    log.error("Tried to query market after a user claimed for a round (epoch: {})", [event.params.questionID.toHexString()]);
  }else{
    market.totalBetsClaimed = market.totalBetsClaimed.plus(ONE_BI);
    market.totalMoneyClaimed = market.totalMoneyClaimed.plus(event.params.amount.divDecimal(SIX_BD));
    market.winRate = market.totalBetsClaimed.divDecimal(market.totalBets.toBigDecimal()).times(HUNDRED_BD);
    market.netMoney = market.netMoney.plus(event.params.amount.divDecimal(SIX_BD));
    market.save();
  }
}

export function handleRewardsCalculated(event: RewardsCalculated): void {
  let market = Market.load("1");
  if (market === null) {
    log.error("Tried to query market after rewards were calculated for a round (epoch: {})", [
      event.params.questionID.toString(),
    ]);
  }else{
    market.totalTreasury = market.totalTreasury.plus(event.params.treasuryAmount.divDecimal(SIX_BD));
    market.save();
  }
}


export function handlePause(event: Pause): void {
  let market = Market.load("1");
  if (market === null) {
    market = new Market("1");
    market.paused = true;
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
  market.paused = true;
  market.save();

  // Pause event was called, cancelling rounds.
  let question = Question.load(event.params.questionID.toHexString());
  if (question !== null) {
    question.failed = true;
    question.save();
  }
}

export function handleUnpause(event: Unpause): void {
  let market = Market.load("1");
  if (market === null) {
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
  market.paused = false;
  market.save();
}

