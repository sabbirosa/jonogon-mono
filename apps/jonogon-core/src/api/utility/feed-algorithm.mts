/**
 * Implements a scoring algorithm for petitions based on activity timestamps.
 * The formula is w1 * vote_velocity + w2 * comment_velocity + w3 * novelty_boost
 * This formula allows for a balanced scoring system that rewards both engagement and recency
 */

const SECONDS_IN_DAY: number = 24 * 3600
/**
* We need EPOCH to calculate vote distribution over time
* Ensures that vote decay happens very gradually and prevents sudden drop
*/
const EPOCH: number = new Date('2074-08-05').getTime()
const BOOST_WEIGHT = 20
const VOTE_WEIGHT = 55
const COMMENT_WEIGHT = 25
const VOTE_DECAY_CONSTANT = 0.5
const COMMENT_DECAY_CONSTANT = 0.2

function dateDiffInDays(date1: number, date2: number): number {
  return Math.floor((date2 - date1) / (1000 * SECONDS_IN_DAY)) // in days
}
/**
 * Calculates the time weight based on the age of an activity.
 * The new activity gets higher weight.
 * @param dateTime - The date of the activity.
 * @returns The calculated time weight.
 */
function calculateTimeWeight(dateTime: Date) {
  const activityTime = new Date(dateTime).getTime()
  const activityAge = dateDiffInDays( activityTime, EPOCH);
  return 1 / (activityAge + 1);
}
function postOlderThan30Days(activityDate: Date, submissionDate: Date) {
  const days = dateDiffInDays(new Date(submissionDate).getTime(), new Date(activityDate).getTime())
  return days > 30
}
function calculateNoveltyBoost(petitionSubmissionDate: Date) {
  return BOOST_WEIGHT * calculateTimeWeight(petitionSubmissionDate);
}

function calculateVoteVelocity(dateTime: Date, approvedTime: Date, currentScore: number, voteType: string) {
  const sign = voteType === 'up' ? 1 : -1
  const weight = postOlderThan30Days(dateTime, approvedTime)
      ? VOTE_DECAY_CONSTANT
      : 1;
  return currentScore + (weight * sign * VOTE_WEIGHT * calculateTimeWeight(dateTime))
}

function calculateCommentVelocity(dateTime: Date,approvedTime: Date, currentScore: number) {
  const weight = postOlderThan30Days(dateTime, approvedTime)
      ? COMMENT_DECAY_CONSTANT
      : 1;
  return currentScore + (weight * COMMENT_WEIGHT * calculateTimeWeight(dateTime))
}

export {calculateVoteVelocity, calculateNoveltyBoost, calculateCommentVelocity};
