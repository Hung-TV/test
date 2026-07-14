import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../models/kanji_learning_list.dart';
import '../models/kanji_session_models.dart';

class KanjiListService {
  final ApiClient _apiClient = ApiClient();

  Future<List<KanjiLearningList>> getLists() async {
    final response = await _apiClient.get(
      ApiConstants.kanjiListAll,
      requireAuth: true,
    );

    final List<dynamic> listData;
    if (response is List) {
      listData = response;
    } else if (response is Map && response['data'] is List) {
      listData = response['data'] as List;
    } else {
      listData = [];
    }

    return listData
        .map(
          (json) => KanjiLearningList.fromJson(
            Map<String, dynamic>.from(json as Map),
          ),
        )
        .toList();
  }

  Future<KanjiLearningList> createList(String name) async {
    final response = await _apiClient.post(
      ApiConstants.kanjiListCreate,
      requireAuth: true,
      body: {'name': name},
    );
    return KanjiLearningList.fromJson(Map<String, dynamic>.from(response as Map));
  }

  Future<KanjiLearningList> startLevelList(String level) async {
    final response = await _apiClient.post(
      ApiConstants.kanjiListStartLevel(level),
      requireAuth: true,
    );
    return KanjiLearningList.fromJson(Map<String, dynamic>.from(response as Map));
  }

  Future<KanjiLearnSessionResponse> getLearnSession({
    required int listId,
    int batchSize = 10,
  }) async {
    final response = await _apiClient.get(
      '${ApiConstants.kanjiListLearn(listId)}?batchSize=$batchSize',
      requireAuth: true,
    );
    return KanjiLearnSessionResponse.fromJson(
      Map<String, dynamic>.from(response as Map),
    );
  }

  Future<void> submitReview({
    required int listId,
    required List<Map<String, dynamic>> reviews,
  }) async {
    await _apiClient.post(
      ApiConstants.kanjiListReview(listId),
      requireAuth: true,
      body: {'reviews': reviews},
    );
  }

  Future<String> explainReviewAnswer({
    required String correctCharacter,
    required String selectedCharacter,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.kanjiListExplain,
      requireAuth: true,
      body: {
        'correctCharacter': correctCharacter,
        'selectedCharacter': selectedCharacter,
      },
    );
    if (response is Map && response['explanation'] != null) {
      return response['explanation'].toString();
    }
    if (response is String && response.trim().isNotEmpty) {
      return response.trim();
    }
    return 'Không có giải thích từ AI.';
  }

  Future<void> addKanjiToList(int listId, int kanjiId) async {
    await _apiClient.post(
      '${ApiConstants.baseUrl}/api/me/kanji-list/$listId/items',
      requireAuth: true,
      body: {'kanjiId': kanjiId},
    );
  }
}
