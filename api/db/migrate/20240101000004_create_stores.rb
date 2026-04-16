class CreateStores < ActiveRecord::Migration[8.0]
  def change
    create_table :stores do |t|
      t.string :name, null: false
      t.string :color, null: false, default: "#4CAF50"
      t.references :household, null: false, foreign_key: true

      t.timestamps
    end

    add_index :stores, [:household_id, :name], unique: true
  end
end
