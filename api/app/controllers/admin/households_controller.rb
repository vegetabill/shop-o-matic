class Admin::HouseholdsController < Admin::ApplicationController
  before_action :set_household, only: [:show, :edit, :update, :destroy, :remove_member, :add_member]

  def index
    @households = Household.includes(:users).order(:name)
  end

  def show
    @members = @household.users.order(:name)
    @non_members = User.where.not(id: @members.select(:id)).order(:name)
  end

  def new
    @household = Household.new
  end

  def create
    @household = Household.new(household_params)
    if @household.save
      @household.seed_defaults!
      redirect_to admin_household_path(@household), notice: "Household created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @household.update(household_params)
      redirect_to admin_household_path(@household), notice: "Household updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @household.destroy
    redirect_to admin_households_path, notice: "#{@household.name} deleted."
  end

  def remove_member
    user = User.find(params[:user_id])
    @household.household_memberships.where(user: user).destroy_all
    redirect_to admin_household_path(@household), notice: "#{user.name} removed from household."
  end

  def add_member
    user = User.find(params[:user_id])
    unless @household.users.include?(user)
      @household.household_memberships.create!(user: user)
    end
    redirect_to admin_household_path(@household), notice: "#{user.name} added to household."
  end

  private

  def set_household
    @household = Household.find(params[:id])
  end

  def household_params
    params.require(:household).permit(:name)
  end
end
