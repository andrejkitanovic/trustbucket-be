import { Schema, model, Document } from 'mongoose';

interface IWidget extends Document {
	selectedCompany: string;
	attributes: any;
	object: any;
	createdAt: Date;
}

const widgetSchema = new Schema(
	{
		selectedCompany: {
			type: Schema.Types.ObjectId,
			ref: 'Company',
		},
		attributes: {},
		object: {},
	},
	{ timestamps: true }
);

const objectModel = model<IWidget>('Widget', widgetSchema);

export default objectModel;
