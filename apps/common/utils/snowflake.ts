export class SnowFlakeId {
  private readonly machineBits = 10n;
  private readonly sequenceBits = 8n;

  // 6 feb 2026 - 18:46 [keep 'start' in .env secret]
  private start = 1770383795974n;

  private lastTimestamp = 0n;
  private counter = 0n;
  private maxCount = 2n ** BigInt(this.sequenceBits);
  private machineId: bigint;

  public constructor(machineId: number) {
    this.machineId = BigInt(machineId);
  }

  /**
   * @returns time till now in milliseconds
   */
  private currentTimestamp(): bigint {
    return BigInt(Date.now());
  }

  /**
   * @returns Snowflake integer id
   */
  public generate(): bigint {
    let timestamp = this.currentTimestamp();

    if (timestamp === this.lastTimestamp) {
      this.counter++;

      if (this.counter > this.maxCount) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = this.currentTimestamp();
        }
      }
    } else {
      this.counter = 0n;
    }

    let snowflakeId = (timestamp - this.start) << this.machineBits;
    snowflakeId |= this.machineId;
    snowflakeId <<= this.sequenceBits;
    snowflakeId |= this.counter;

    this.lastTimestamp = timestamp;

    return snowflakeId;
  }
}
