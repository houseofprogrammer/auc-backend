import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterItemsTable1689140798533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'time_window',
        type: 'integer',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'end_bid_time',
        type: 'timestamp',
        default: 'now()',
      }),
    );

    await queryRunner.addColumn(
      'items',
      new TableColumn({
        name: 'winner_user_id',
        type: 'integer',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('items', 'time_window');
    await queryRunner.dropColumn('items', 'end_bid_time');
    await queryRunner.dropColumn('items', 'winner_user_id');
  }
}
