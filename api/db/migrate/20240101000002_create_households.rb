class CreateHouseholds < ActiveRecord::Migration[8.0]
  def change
    create_table :households do |t|
      t.string :name, null: false
      t.string :share_token, null: false

      t.timestamps
    end

    add_index :households, :share_token, unique: true
  end
end
