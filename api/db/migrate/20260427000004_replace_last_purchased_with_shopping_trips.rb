class ReplaceLastPurchasedWithShoppingTrips < ActiveRecord::Migration[8.0]
  def up
    create_table :shopping_trips do |t|
      t.references :household, null: false, foreign_key: true
      t.references :store, null: true, foreign_key: { on_delete: :nullify }
      t.datetime :completed_at, null: false
      t.timestamps
    end

    create_table :shopping_trip_items do |t|
      t.references :shopping_trip, null: false, foreign_key: true
      t.references :item, null: false, foreign_key: true
      t.string :status, null: false
      t.timestamps
    end

    add_index :shopping_trip_items, [:shopping_trip_id, :item_id], unique: true

    # Backfill: convert each item's last_purchased_at into a synthetic ShoppingTrip.
    # We pre-assign IDs via nextval so we can join trip→item in a single pass without
    # ambiguity even if multiple items share the same (household, store, timestamp).
    execute <<~SQL
      ALTER TABLE items ADD COLUMN _last_trip_id bigint;

      UPDATE items
      SET _last_trip_id = nextval('shopping_trips_id_seq')
      WHERE last_purchased_at IS NOT NULL;

      INSERT INTO shopping_trips (id, household_id, store_id, completed_at, created_at, updated_at)
      SELECT _last_trip_id, household_id, last_purchased_store_id, last_purchased_at, NOW(), NOW()
      FROM items
      WHERE last_purchased_at IS NOT NULL;

      INSERT INTO shopping_trip_items (shopping_trip_id, item_id, status, created_at, updated_at)
      SELECT _last_trip_id, id, 'purchased', NOW(), NOW()
      FROM items
      WHERE last_purchased_at IS NOT NULL;

      ALTER TABLE items DROP COLUMN _last_trip_id;
    SQL

    # Now safe to remove the old columns
    remove_reference :items, :last_purchased_store, foreign_key: { to_table: :stores }
    remove_column :items, :last_purchased_at, :datetime
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
