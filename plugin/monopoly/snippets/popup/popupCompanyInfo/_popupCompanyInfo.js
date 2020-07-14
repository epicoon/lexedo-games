/**
 * @var Snippet lx.Box
 * */

const Form = Snippet.widget.parent;
const Pult = Snippet->>pult;

let currentCompany = null;

Form.open = function(company) {
	company.bind(Snippet.widget);
	currentCompany = company;
	this->header.text('Данные о компании: ' + company.name);

	Pult.getChildren().call('disabled', true);
	Pult->butClose.disabled(false);
	// if (company.isOwner(lxMonopoly.game.currentGamer)) {
	// 	Pult->butSell.disabled(false);
	// 	Pult->butCredit.disabled(false);
	// 	Pult->butChange.disabled(false);
	// 	if (company.addBranchAvailable()) Pult->butAddBranch.disabled(false);
	// 	if (company.delBranchAvailable()) Pult->butDelBranch.disabled(false);
	// }

	this.show();
}

Form.close = function() {
	if (!currentCompany) return;
	this.hide();
	currentCompany.unbind(Snippet.widget);
	currentCompany = null;
}

Pult->butClose.click(()=>Form.close());
// 	Pult->butSell.click();
// 	Pult->butCredit.click();
// 	Pult->butChange.click();
// 	Pult->butAddBranch.click();
// 	Pult->butDelBranch.click();
