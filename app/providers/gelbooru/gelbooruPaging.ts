// min and max included
const randomIntFromInterval = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1) + min);

const MAX_API_ALLOWED_PAGE_COUNT = 20000;

export class GelbooruPaging {
	private totalPageCount: number;
	private currentPageCount: number;
	private startedPageCount: number;
	private started: boolean;

	constructor(totalPageCount: number) {
		this.totalPageCount = Math.min(totalPageCount, MAX_API_ALLOWED_PAGE_COUNT);
		this.startedPageCount = randomIntFromInterval(0, this.totalPageCount);
		this.currentPageCount = this.startedPageCount;
		this.incrementCurrentPageCount();
		this.started = false;
	}

	private incrementCurrentPageCount(): void {
		if (this.currentPageCount >= this.totalPageCount) {
			this.currentPageCount = 0;
		} else {
			this.currentPageCount += 1;
		}
		this.started = true;
	}

	public getNextPageIndex(): number | null {
		if (this.started && this.currentPageCount === this.startedPageCount) {
			return null;
		}

		this.incrementCurrentPageCount();
		return this.currentPageCount;
	}
}
