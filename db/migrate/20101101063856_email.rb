class Email < ActiveRecord::Migration
  def self.up
      add_column :users, :email, :string
      add_column :users, :fullname, :string
  end

  def self.down
      remove_column :users, :email
      remove_column :users, :fullname
  end
end
