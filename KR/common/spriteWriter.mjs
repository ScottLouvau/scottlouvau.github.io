export default class SpriteWriter {
    constructor(width, height, cols, rows, saveToFolderPath, createCanvas, saveAsPng) {
        this.width = width;
        this.height = height;
        this.cols = cols;
        this.rows = rows;
        this.countPerFile = cols * rows;

        this.saveToFolderPath = saveToFolderPath;
        this.createCanvas = createCanvas;
        this.saveAsPng = saveAsPng;

        this.ctx = null;
        this.currentCount = 0;
        this.fileCount = 0;
        this.totalCount = 0;
    }

    async nextCanvas() {
        if (this.currentCount > 0) {
            var toSave = this.can;

            if (this.currentCount < this.countPerFile) {
                toSave = this.createCanvas(this.width * this.cols, this.height * (Math.ceil(this.currentCount / this.cols)));
                var ctx = toSave.getContext('2d');
                ctx.drawImage(this.can, 0, 0, toSave.width, toSave.height, 0, 0, toSave.width, toSave.height);
            }

            await this.saveAsPng(`${this.saveToFolderPath}/${this.fileCount.toFixed(0)}.png`, toSave);
        }

        this.can = this.createCanvas(this.width * this.cols, this.height * this.rows);
        this.ctx = this.can.getContext('2d');

        this.ctx.fillStyle = 'transparent';
        this.ctx.fillRect(0, 0, this.can.width, this.can.height);

        this.fileCount++;
        this.currentCount = 0;
    }

    async appendImage(fromCanvas, x, y) {
        if (this.ctx === null || this.currentCount === this.countPerFile) {
            await this.nextCanvas();
        }

        var row = Math.floor(this.currentCount / this.cols);
        var col = this.currentCount - (this.cols * row);

        this.ctx.drawImage(
            fromCanvas, 
            x, 
            y, 
            this.width, 
            this.height, 
            this.width * col, 
            this.height * row, 
            this.width, 
            this.height
        );

        this.currentCount++;
        this.totalCount++;
    }
}