class CreateUsers < ActiveRecord::Migration
  def self.up
      create_table :users do |t|
      t.string :username, :null => false, :limit => 255, :unique => true
      t.string :password, :null => false, :limit => 255,

      t.timestamps
    end
  end

  def self.down
    drop_table :users
  end
end
