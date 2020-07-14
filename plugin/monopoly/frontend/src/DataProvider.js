class DataProvider #lx:namespace lxMonopoly {
	constructor() {
		this.mapSequence = [];
		this.companiesData = {};
		this.eventsData = {};
		this.anglesData = {};

		this.companies = {};

		this.waitBox = new lx.Box();
		this.waitBox.fill('lightgray');
	}

	loadData() {
		^Respondent.getData().then((res)=>{
			this.mapSequence = res.sequence;
			this.companiesData = new lx.Dict(res.companies);
			this.eventsData = res.events;
			this.anglesData = res.angles;
			this.waitBox.del();

			this.companiesData.each((data, key)=>{
				this.companies[key] = new lxMonopoly.Company(data);
			});
		});
	}

	getCompany(key) {
		return this.companies[key];
	}
}
