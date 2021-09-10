class Company extends lx.BindableModel #lx:namespace lxMonopoly {
	#lx:schema
		key,
		category,
		name,
		index: {default: false},
		cost,
		branchCost,
		income,
		incomeBase << income[0],
		incomeMonopoly << income[1],
		incomeBranch1 << income[2],
		incomeBranch2 << income[3],
		incomeBranch3 << income[4],
		incomeBranch4 << income[5],
		incomeBranch5 << income[6];

	isGrouped() {
		return this.index !== false;
	}
}
