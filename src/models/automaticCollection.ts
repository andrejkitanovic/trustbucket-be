import { Schema, model, Document } from 'mongoose';

interface IAutomaticCollection extends Document {
	company: string;
	template: string;
	slug: string;
	delay: number;
}

const automaticCollectionSchema = new Schema({
	company: {
		type: Schema.Types.ObjectId,
		ref: 'Company',
	},
	template: {
		type: Schema.Types.ObjectId,
		ref: 'Email Template',
	},
	slug: {
		type: String,
		required: true,
	},
	delay: {
		type: Number,
		required: true,
	},
});

const objectModel = model<IAutomaticCollection>('Automatic Collection', automaticCollectionSchema);

export default objectModel;
