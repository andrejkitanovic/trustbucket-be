import { Schema, model, Document } from 'mongoose';

interface IFeedback extends Document {
	company: string;
	message: string;
}

const feedbackSchema = new Schema({
	company: {
		type: Schema.Types.ObjectId,
		ref: 'Company',
	},
	message: {
		type: String,
		required: true,
	},
});

const objectModel = model<IFeedback>('Feedback', feedbackSchema);

export default objectModel;
